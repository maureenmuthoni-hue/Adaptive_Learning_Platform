import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

function TeacherPage() {
  const [classSummary, setClassSummary] = useState(null);
  const [strugglingStudents, setStrugglingStudents] = useState([]);
  const [hardestTopics, setHardestTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summary, struggling, topics] = await Promise.all([
          api.getClassSummary(),
          api.getStrugglingStudents(0.6),
          api.getHardestTopics(5)
        ]);
        setClassSummary(summary.data);
        setStrugglingStudents(struggling.data);
        setHardestTopics(topics.data);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to connect to backend. Make sure it\'s running on port 8000');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>
      
      {/* Class Summary Cards */}
      {classSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">{classSummary.total_students}</div>
            <div className="text-gray-600 mt-1">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">{Math.round(classSummary.class_average * 100)}%</div>
            <div className="text-gray-600 mt-1">Class Average</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-red-600">{classSummary.struggling_count}</div>
            <div className="text-gray-600 mt-1">Need Support</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600">{classSummary.excelling_count}</div>
            <div className="text-gray-600 mt-1">Excelling</div>
          </div>
        </div>
      )}

      {/* Hardest Topics */}
      {hardestTopics.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Most Challenging Topics</h2>
          <div className="space-y-4">
            {hardestTopics.map((topic, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-red-600">{Math.round(topic.average_score * 100)}% success</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${topic.average_score * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{topic.total_attempts} attempts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Struggling Students */}
      {strugglingStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-orange-500 mr-2">⚠️</span>
            Students Needing Support
          </h2>
          <div className="space-y-3">
            {strugglingStudents.map((student, idx) => (
              <div key={idx} className="p-4 bg-orange-50 rounded-lg">
                <div className="font-semibold text-gray-900">{student.student_name}</div>
                <div className="text-sm text-orange-600">Average Score: {Math.round(student.average_score * 100)}%</div>
                <div className="text-sm text-gray-600">Total Attempts: {student.total_attempts}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!strugglingStudents.length && !hardestTopics.length) && (
        <div className="bg-green-50 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">All Students Are Doing Great!</h3>
          <p className="text-green-600">Keep up the excellent work!</p>
        </div>
      )}
    </div>
  );
}

export default TeacherPage;