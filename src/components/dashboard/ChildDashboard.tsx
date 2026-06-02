import { useEffect, useState } from 'react';
import { FaStar, FaFire, FaChartBar, FaUserGraduate } from 'react-icons/fa';
import StreakCalendar from '../therapy/StreakCalendar';
import ComplianceBadges from '../therapy/ComplianceBadges';

interface ProgressSummary {
  childName: string;
  totalXP: number;
  exercisesCompleted: number;
  streak: number;
  weeklyStats: number;
  level: number;
  nextLevelXP: number;
}

export default function ChildDashboard() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    fetch('/api/get-progress-summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error('Failed to fetch summary:', err));
  }, []);

  if (!summary) return <div className="p-8 text-center">Loading your progress...</div>;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
            Hi, {summary.childName}! 👋
          </h2>
          <p className="text-xl font-medium opacity-90">
            You are doing amazing! Ready to level up your vision powers today?
          </p>
        </div>
        <div className="absolute right-[-20px] top-[-20px] text-[12rem] opacity-10 rotate-12">
          <FaUserGraduate />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Level Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl text-yellow-600 mb-4 shadow-inner">
            {summary.level}
          </div>
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Vision Level</span>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-yellow-400 h-full" 
              style={{ width: `${(summary.totalXP % 500) / 5}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 mt-1">{summary.nextLevelXP} XP to Level {summary.level + 1}</span>
        </div>

        {/* XP Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl text-blue-600 mb-4 shadow-inner">
            <FaStar />
          </div>
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total XP</span>
          <span className="text-3xl font-black text-blue-900 mt-1">{summary.totalXP}</span>
        </div>

        {/* Streak Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl text-orange-600 mb-4 shadow-inner">
            <FaFire />
          </div>
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Day Streak</span>
          <span className="text-3xl font-black text-orange-900 mt-1">{summary.streak}</span>
        </div>

        {/* Weekly Stats Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl text-green-600 mb-4 shadow-inner">
            <FaChartBar />
          </div>
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">This Week</span>
          <span className="text-3xl font-black text-green-900 mt-1">{summary.weeklyStats}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StreakCalendar />
        <ComplianceBadges />
      </div>

      <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100 flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold text-purple-900 mb-4">Daily Challenge 🚀</h3>
        <p className="text-purple-800 mb-6 max-w-md">
          Complete 20 minutes of patching and play 1 game today to unlock a special Nature Story!
        </p>
        <div className="flex gap-4">
          <button className="btn btn-purple bg-purple-600 hover:bg-purple-700 text-white border-none rounded-2xl px-8 shadow-md">
            Go to Therapy
          </button>
        </div>
      </div>
    </div>
  );
}
