import React from 'react';
import { Link } from 'react-router-dom';

function HomePage({ backendStatus }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">AI-Powered Adaptive Learning System</h1>
          <p className="text-xl mb-8">Experience personalized learning with real-time AI feedback</p>
          <div className="space-x-4">
            <Link to="/student" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block">
              Start Learning
            </Link>
            <Link to="/teacher" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 inline-block">
              Teacher Dashboard
            </Link>
          </div>
          {backendStatus === 'online' && (
            <div className="mt-4 text-blue-200">✅ Backend connected and ready</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;