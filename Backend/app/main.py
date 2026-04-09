from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, get_db, Student, QuizResult
from app.schema import (
    QuizSubmission, QuizResponse, GenerateQuestionRequest, 
    GenerateQuestionResponse, StudentCreate, StudentResponse
)
from services import AIService, AnalyticsService

ai_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_service
    print("=" * 50)
    print("Starting AI-Powered Adaptive Learning System")
    print("=" * 50)
    
    print("Initializing database...")
    await init_db()
    
    print("Initializing AI Service...")
    ai_service = AIService()
    
    print("System ready!")
    print("=" * 50)
    yield
    
    print("Shutting down...")

app = FastAPI(
    title="AI-Powered Adaptive Learning System",
    description="A learning platform that adapts to each student using AI",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AI-Powered Adaptive Learning System",
        "endpoints": {
            "submit_answer": "POST /quiz/submit",
            "generate_question": "POST /quiz/generate-question",
            "create_student": "POST /students",
            "struggling_students": "GET /analytics/struggling-students",
            "hardest_topics": "GET /analytics/hardest-topics",
            "student_performance": "GET /analytics/student-performance/{student_id}",
            "class_summary": "GET /analytics/class-summary",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "running",
        "database": db_status,
        "ai_service": "configured",
        "embeddings": "initialized"
    }


@app.post("/students", response_model=StudentResponse)
async def create_student(student: StudentCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_student = Student(name=student.name, email=student.email)
        db.add(db_student)
        await db.commit()
        await db.refresh(db_student)
        return db_student
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/quiz/submit", response_model=QuizResponse)
async def submit_answer(
    submission: QuizSubmission,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Student).where(Student.id == submission.student_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Student not found")
    
    similar_mistakes = await ai_service.find_similar_mistakes(
        submission.student_answer, submission.topic
    )
    
    ai_response = await ai_service.generate_feedback(
        submission.dict(),
        similar_mistakes.get('documents', [[]])[0] if similar_mistakes else None
    )
    
    question_embedding = ai_service.generate_embedding(submission.question)

    quiz_result = QuizResult(
        student_id=submission.student_id,
        topic=submission.topic,
        question=submission.question,
        student_answer=submission.student_answer,
        correct_answer=submission.correct_answer,
        is_correct=ai_response['is_correct'],
        time_taken_seconds=submission.time_taken_seconds,
        ai_feedback=ai_response['feedback'],
        question_embedding=question_embedding
    )
    
    db.add(quiz_result)
    await db.commit()
    await db.refresh(quiz_result)
    
    # Create a new session for background tasks to avoid session conflicts
    async def update_performance_background(student_id: int, topic: str):
        from app.database import AsyncSessionLocal
        async with AsyncSessionLocal() as bg_db:
            await AnalyticsService.update_performance_history(bg_db, student_id, topic)
    
    async def store_embedding_background(quiz_id: int, question: str, topic: str):
        await ai_service.store_question_embedding(quiz_id, question, topic)
    
    async def store_mistake_background(student_answer: str, correct_answer: str, topic: str, feedback: str):
        await ai_service.store_mistake_pattern(student_answer, correct_answer, topic, feedback)
    
    if not ai_response['is_correct']:
        background_tasks.add_task(
            store_mistake_background,
            submission.student_answer,
            submission.correct_answer,
            submission.topic,
            ai_response['feedback']
        )
    
    background_tasks.add_task(
        update_performance_background,
        submission.student_id,
        submission.topic
    )
    
    background_tasks.add_task(
        store_embedding_background,
        quiz_result.id,
        submission.question,
        submission.topic
    )
    
    return QuizResponse(
        quiz_result_id=quiz_result.id,
        is_correct=ai_response['is_correct'],
        ai_feedback=ai_response['feedback'],
        follow_up_question=ai_response.get('follow_up_question')
    )

@app.post("/quiz/generate-question", response_model=GenerateQuestionResponse)
async def generate_question(request: GenerateQuestionRequest):
    question = await ai_service.generate_quiz_question(
        request.topic, request.difficulty, request.previous_questions
    )
    return GenerateQuestionResponse(**question)

@app.get("/quiz/similar-questions/{question_id}")
async def get_similar_questions(question_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(QuizResult.question, QuizResult.topic).where(QuizResult.id == question_id)
    )
    question_data = result.fetchone()
    
    if not question_data:
        raise HTTPException(status_code=404, detail="Question not found")
    
    similar = await ai_service.find_similar_questions(question_data[0], question_data[1])
    return {"similar_questions": similar.get('documents', [[]])[0] if similar else []}

@app.get("/analytics/struggling-students")
async def get_struggling_students(
    threshold: float = 0.6,
    db: AsyncSession = Depends(get_db)
):
    return await AnalyticsService.find_struggling_students(db, threshold)

@app.get("/analytics/hardest-topics")
async def get_hardest_topics(
    min_attempts: int = 10,
    db: AsyncSession = Depends(get_db)
):
    return await AnalyticsService.find_hardest_topics(db, min_attempts)

@app.get("/analytics/student-performance/{student_id}")
async def get_student_performance(student_id: int, db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_student_performance(db, student_id)

@app.get("/analytics/class-summary")
async def get_class_summary(db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_class_summary(db)

@app.get("/analytics/topic-breakdown")
async def get_topic_breakdown(topic: str = None, db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT 
            topic,
            COUNT(*) as total_attempts,
            AVG(is_correct::float) as success_rate,
            AVG(time_taken_seconds) as avg_time_seconds,
            COUNT(DISTINCT student_id) as unique_students
        FROM quiz_results
        WHERE (:topic IS NULL OR topic = :topic)
        GROUP BY topic
        ORDER BY success_rate ASC
    """)
    
    result = await db.execute(query, {"topic": topic})
    rows = result.fetchall()
    
    return [
        {
            "topic": row[0],
            "total_attempts": row[1],
            "success_rate": float(row[2]),
            "average_time_seconds": float(row[3]),
            "unique_students": row[4]
        }
        for row in rows
    ]