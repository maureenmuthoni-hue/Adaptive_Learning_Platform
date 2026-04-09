import React, { useState } from 'react';
import { api } from '../src/api/client';
import { Send, Loader2, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';

const TOPICS = [
  'Python Programming',
  'Machine Learning',
  'Web Development',
  'Data Science',
  'Artificial Intelligence',
  'Cloud Computing'
];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

function QuizInterface({ studentId, onAnswerSubmit }) {
  const [topic, setTopic] = useState('Python Programming');
  const [difficulty, setDifficulty] = useState('medium');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const generateNewQuestion = async () => {
    setLoading(true);
    setResult(null);
    setFeedback(null);
    setStudentAnswer('');

    try {
      const response = await api.generateQuestion(topic, difficulty);
      setCurrentQuestion(response.data);
      setStartTime(Date.now());
    } catch (err) {
      console.error('Failed to generate question:', err);
      alert('Failed to generate question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim()) {
      alert('Please enter your answer');
      return;
    }

    setLoading(true);
    const timeTaken = (Date.now() - startTime) / 1000;

    try {
      const submission = {
        student_id: studentId,
        topic: topic,
        question: currentQuestion.question,
        student_answer: studentAnswer,
        correct_answer: currentQuestion.correct_answer,
        time_taken_seconds: timeTaken
      };

      const response = await api.submitAnswer(submission);
      setResult(response.data);
      setFeedback(response.data.ai_feedback);

      // Refresh parent performance data
      onAnswerSubmit();
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    generateNewQuestion();
  };

  return (
    <div className="space-y-6">
      {/* Question Generation Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field"
              disabled={loading}
            >
              {TOPICS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
              disabled={loading}
            >
              {DIFFICULTY_LEVELS.map(d => (
                <option key={d} value={d}>{d.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateNewQuestion}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate Question
            </button>
          </div>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="card">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Question</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {difficulty.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-800 text-lg mb-4">{currentQuestion.question}</p>

            {currentQuestion.options && (
              <div className="space-y-2 mb-4">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg cursor-pointer transition ${studentAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setStudentAnswer(option)}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </div>
                ))}
              </div>
            )}

            {!currentQuestion.options && (
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Type your answer here..."
                disabled={loading}
              />
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !studentAnswer}
              className="btn-primary flex items-center flex-1 justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Answer
            </button>

            {result && (
              <button
                onClick={handleNextQuestion}
                className="btn-secondary flex items-center"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Next Question
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div className={`card border-l-4 ${result?.is_correct ? 'border-green-500' : 'border-orange-500'}`}>
          <div className="flex items-start">
            <Lightbulb className={`h-5 w-5 mr-3 mt-0.5 ${result?.is_correct ? 'text-green-500' : 'text-orange-500'}`} />
            <div className="flex-1">
              <h4 className="font-semibold mb-2">
                {result?.is_correct ? '✓ Great Job!' : '📚 AI Tutor Feedback'}
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>

              {result?.follow_up_question && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Follow-up practice:</strong> {result.follow_up_question}
                  </p>