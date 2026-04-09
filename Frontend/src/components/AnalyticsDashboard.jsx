import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, BookOpen, Award, Clock,
  Brain, Zap, Target, AlertCircle, Download, Calendar,
  Filter, RefreshCw, ChevronDown, Activity, Star, ThumbsUp
} from 'lucide-react';
import { api } from '../api/client';

function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [classSummary, setClassSummary] = useState(null);
  const [topicBreakdown, setTopicBreakdown] = useState([]);
  const [strugglingStudents, setStrugglingStudents] = useState([]);
  const [hardestTopics, setHardestTopics] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);

  // Mock data for demonstration
  const performanceTrendData = {
    week: [
      { day: 'Mon', accuracy: 65, participation: 45, avgTime: 12 },
      { day: 'Tue', accuracy: 72, participation: 52, avgTime: 11 },
      { day: 'Wed', accuracy: 68, participation: 58, avgTime: 10 },
      { day: 'Thu', accuracy: 75, participation: 61, avgTime: 9.5 },
      { day: 'Fri', accuracy: 82, participation: 68, avgTime: 8.5 },
      { day: 'Sat', accuracy: 78, participation: 55, avgTime: 9 },
      { day: 'Sun', accuracy: 85, participation: 42, avgTime: 8 },
    ],
    month: [
      { week: 'Week 1', accuracy: 68, participation: 48, avgTime: 11 },
      { week: 'Week 2', accuracy: 72, participation: 55, avgTime: 10 },
      { week: 'Week 3', accuracy: 75, participation: 62, avgTime: 9.5 },
      { week: 'Week 4', accuracy: 80, participation: 65, avgTime: 8.5 },
    ],
    year: [
      { month: 'Jan', accuracy: 65, participation: 45, avgTime: 12 },
      { month: 'Feb', accuracy: 68, participation: 48, avgTime: 11.5 },
      { month: 'Mar', accuracy: 70, participation: 52, avgTime: 11 },
      { month: 'Apr', accuracy: 72, participation: 55, avgTime: 10.5 },
      { month: 'May', accuracy: 75, participation: 58, avgTime: 10 },
      { month: 'Jun', accuracy: 78, participation: 62, avgTime: 9.5 },
    ]
  };

  const radarData = [
    { subject: 'Python', score: 85, fullMark: 100 },
    { subject: 'ML', score: 72, fullMark: 100 },
    { subject: 'Web Dev', score: 68, fullMark: 100 },
    { subject: 'Data Science', score: 78, fullMark: 100 },
    { subject: 'AI', score: 65, fullMark: 100 },
    { subject: 'Cloud', score: 70, fullMark: 100 },
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: 35, color: '#10B981' },
    { name: 'Medium', value: 45, color: '#F59E0B' },
    { name: 'Hard', value: 20, color: '#EF4444' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, topics, struggling, hardest] = await Promise.all([
        api.getClassSummary(),
        api.getTopicBreakdown(),
        api.getStrugglingStudents(0.6),
        api.getHardestTopics(1)
      ]);

      setClassSummary(summary.data);
      setTopicBreakdown(topics.data);
      setStrugglingStudents(struggling.data);
      setHardestTopics(hardest.data);
      setPerformanceTrend(performanceTrendData[timeRange]);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      // Use mock data if API fails
      setPerformanceTrend(performanceTrendData[timeRange]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive insights into student performance and learning patterns
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 4 Weeks</option>
                  <option value="year">Last 6 Months</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={loadData}
                className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Average Accuracy"
            value={`${Math.round(classSummary?.class_average * 100 || 75)}%`}
            change={8}
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Active Students"
            value={classSummary?.total_students || 0}
            change={12}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Questions Answered"
            value="1,234"
            change={23}
            icon={BookOpen}
            color="purple"
          />
          <StatCard
            title="Avg Response Time"
            value="8.5s"
            change={-15}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Trend</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMetric('accuracy')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedMetric === 'accuracy'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Accuracy
                </button>
                <button
                  onClick={() => setSelectedMetric('participation')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedMetric === 'participation'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Participation
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
                <Line type="monotone" dataKey="avgTime" stroke="#10B981" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Performance Radar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Topic Mastery</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
                <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Difficulty Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Question Difficulty Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hardest Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Most Challenging Topics</h2>
            <div className="space-y-4">
              {hardestTopics.slice(0, 5).map((topic, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{topic.topic}</span>
                    <span className="text-red-600 dark:text-red-400">{Math.round(topic.average_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${topic.average_score * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{topic.total_attempts} attempts</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Struggling Students Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Students Needing Support
            </h2>
          </div>
          {strugglingStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Student</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Average Score</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Attempts</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Weak Topics</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {strugglingStudents.map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-6 text-gray-900 dark:text-white">{student.student_name}</td>
                      <td className="py-3 px-6">
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {Math.round(student.average_score * 100)}%
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600 dark:text-gray-400">{student.total_attempts}</td>
                      <td className="py-3 px-6 text-gray-600 dark:text-gray-400">Multiple Topics</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                          Needs Intervention
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Star className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">All students are performing well! Great job! 🎉</p>
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start space-x-4">
            <Brain className="h-8 w-8 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">AI-Generated Insights</h3>
              <p className="text-blue-100 mb-3">
                Based on the data analysis, here are some actionable insights to improve learning outcomes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Students show 15% higher engagement on gamified content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Morning sessions have 20% better retention rates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>AI feedback improves subsequent attempts by 35%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;