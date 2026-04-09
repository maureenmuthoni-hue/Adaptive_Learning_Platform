# AI-Powered Adaptive Learning System

An intelligent learning platform that adapts to each student using AI-powered feedback, real-time analytics, and personalized learning paths.

## Features

- **AI-Powered Feedback** - Instant, personalized explanations using Groq's Mixtral model
- **Real-Time Analytics** - Track student performance with detailed metrics and visualizations
- **Adaptive Learning** - Questions adjust to student's skill level
- **Semantic Search** - Find similar questions using vector embeddings (ChromaDB)
- **Performance Tracking** - Monitor progress across different topics
- **Teacher Dashboard** - Identify struggling students and difficult topics
- **Modern UI** - Built with React + Tailwind CSS
- **High Performance** - Async database operations with connection pooling

## Architecture
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ React │────▶│ FastAPI │────▶│ PostgreSQL │
│ Frontend │◀────│ Backend │◀────│ Database │
│ Port 3000 │ │ Port 8000 │ │ │
└─────────────┘ └──────┬──────┘ └─────────────┘
│
┌──────▼──────┐
│ Groq AI │
│ & Chroma │
└─────────────┘
```

## Technology Stack

### Backend
- **FastAPI** - High-performance web framework
- **SQLAlchemy** - Async ORM for database operations
- **PostgreSQL** - Relational database
- **Groq API** - AI-powered feedback generation
- **ChromaDB** - Vector database for semantic search
- **Sentence Transformers** - Text embeddings (all-MiniLM-L6-v2)

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 15+ (or Aiven cloud database)
- Groq API key ([Get one here](https://console.groq.com/keys))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/adaptive-learning-system.git
cd adaptive-learning-system
```
### 2. Backend Setup
**Navigate to backend directory**
cd Backend

**Create virtual environment**
python -m venv venv

**Activate virtual environment**
**Windows:**
venv\Scripts\activate
**Mac/Linux:**
source venv/bin/activate

**Install dependencies**
pip install -r requirements.txt

**Create .env file**
cp .env.example .env

- Edit .env with your database URL and Groq API key
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/dbname
GROQ_API_KEY=your_groq_api_key_here

**Initialize database and run server**
python run.py

### 3. Frontend Setup
**Open a new terminal, navigate to frontend directory**
cd Frontend

**Install dependencies**
npm install --legacy-peer-deps

**Start development server**
npm run dev
### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure
```
adaptive-learning-system/
├── Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI application
│   │   ├── database.py       # Database models & connection
│   │   ├── schema.py         # Pydantic schemas
│   │── services/
│   │   ├── ai_service.py     # Groq AI integration
│   │   └── analytics.py      # Performance analytics
│   ├── requirements.txt
│   ├── run.py
│   └── .env
│
└── Frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js     # API client
    │   ├── components/
    │   │   ├── QuizInterface.jsx
    │   │   ├── PerformanceChart.jsx
    │   │   └── AnalyticsDashboard.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── StudentPage.jsx
    │   │   └── TeacherPage.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```
    
## Database Schema
**Students Table**
- id (PK) - Auto-incrementing ID
- name - Student's full name
- email - Unique email address
- created_at - Registration timestamp

**Quiz Results Table**
- id (PK) - Auto-incrementing ID
- student_id (FK) - References students
- topic - Subject category
- question - Question text
- student_answer - Student's response
- correct_answer - Expected answer
- is_correct - Boolean result
- time_taken_seconds - Response time
- ai_feedback - AI-generated explanation
- created_at - Submission timestamp

**Performance History Table**
- id (PK) - Auto-incrementing ID
- student_id (FK) - References students
- topic - Subject category
- average_score - Running average (0-100)
- total_attempts - Total questions attempted
- correct_attempts - Correct answers count
- average_time_seconds - Average response time
- last_updated - Last update timestamp

## Key Features Explained
**AI Feedback Generation**
When a student submits an answer, the system:
- Checks correctness
- Sends context to Groq API
- Generates personalized feedback
- Creates follow-up questions for wrong answers
- Stores feedback for future reference

**Performance Analytics**
- GROUP BY queries for topic aggregation
- HAVING clauses for filtering groups
- Window functions for trend analysis
- Materialized views for fast reporting

**Vector Search (ChromaDB)**
- Converts questions to 384-dimension vectors
- Stores embeddings for semantic search
- Finds similar questions across topics
- Identifies common mistake patterns

**Performance Optimizations**
- Async database operations - Non-blocking I/O
- Connection pooling - Efficient database connections
- Background tasks - Non-blocking AI operations
- Query optimization - Strategic indexes
- Lazy loading - Efficient data fetching

# License
This project is licensed under the MIT License - see the LICENSE file for details.




