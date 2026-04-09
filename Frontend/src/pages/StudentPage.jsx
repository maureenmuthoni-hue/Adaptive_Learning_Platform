import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

function StudentPage() {
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.createStudent(studentName, `${studentName.toLowerCase().replace(/\s/g, '')}@student.com`);
      setStudentId(response.data.id);
      setShowQuiz(true);
    } catch (err) {
      console.error('Failed to create student:', err);
      alert('Failed to create student. Make sure backend is running on port 8000!');
    } finally {
      setLoading(false);
    }
  };

  if (!showQuiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Student!</h1>
          <p className="text-gray-600 text-center mb-6">Enter your name to start learning</p>
          <form onSubmit={handleCreateStudent}>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Start Learning'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Student Portal</h1>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">✅ Ready to start learning!</p>
          <p className="text-sm text-gray-600 mt-1">Student ID: {studentId}</p>
        </div>
        <p className="text-gray-600">The full quiz interface will be available once you generate questions.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default StudentPage;