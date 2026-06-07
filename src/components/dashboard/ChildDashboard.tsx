import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaFire, FaChartBar, FaUserGraduate, FaCheckCircle, FaRocket } from 'react-icons/fa';
import StreakCalendar from '../therapy/StreakCalendar';
import AchievementBadges from '../therapy/AchievementBadges';

interface ProgressSummary {
  childName: string;
  totalXP: number;
  exercisesCompleted: number;
  streak: number;
  weeklyStats: number;
  level: number;
  nextLevelXP: number;
  weeklyChallenge: {
    count: number;
    total: number;
    completed: boolean;
    types: string[];
  };
}

export default function ChildDashboard() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/get-progress-summary')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch summary');
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSummary(data);
      })
      .catch(err => {
        console.error('Failed to fetch summary:', err);
        setError(err.message);
      });
  }, []);

  if (error) return (
    <div className="p-8 text-center bg-red-50 rounded-3xl border-2 border-red-100">
      <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong.</h3>
      <p className="text-red-600">{error}</p>
      <button onClick={() => window.location.reload()} className="btn btn-error mt-4 text-white rounded-xl px-8">Try Again</button>
    </div>
  );

  if (!summary) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="loading loading-spinner loading-lg text-green-500"></div>
      <p className="text-gray-500 font-medium animate-pulse">Summoning your vision powers...</p>
    </div>
  );

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
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Sessions This Week</span>
          <span className="text-3xl font-black text-green-900 mt-1">{summary.weeklyStats}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StreakCalendar />
        <AchievementBadges />
      </div>

      {/* Weekly Mission Section */}
      <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-20 -translate-x-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-800/50 px-4 py-1.5 rounded-full border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-widest mb-4">
              <FaRocket className="text-indigo-400" /> Weekly Mission
            </div>
            <h3 className="text-4xl font-black mb-4">Master of Variety 🏆</h3>
            <p className="text-indigo-100 text-lg mb-8 max-w-lg leading-relaxed">
              Complete at least <span className="text-yellow-400 font-black">5 different types</span> of vision exercises this week to earn the <strong>Weekly Master</strong> badge!
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-indigo-300">Progress: {summary.weeklyChallenge.count}/5 Types</span>
                <span className="text-2xl font-black text-white">{Math.round((summary.weeklyChallenge.count / 5) * 100)}%</span>
              </div>
              <div className="w-full bg-indigo-950 h-5 rounded-full overflow-hidden border-2 border-indigo-800">
                <div 
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 h-full shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (summary.weeklyChallenge.count / 5) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 w-full max-w-sm">
            <h4 className="text-lg font-black mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-400" /> Mastery Log
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.weeklyChallenge.types.length > 0 ? (
                summary.weeklyChallenge.types.map(type => (
                  <span key={type} className="bg-indigo-500/40 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/10">
                    {type.replace(/_/g, ' ')}
                  </button>
                ))
              ) : (
                <p className="text-indigo-200/60 text-sm italic">No exercises completed yet this week. Start your first mission!</p>
              )}
            </div>
            <button 
              onClick={() => navigate('/therapy')}
              className="w-full mt-8 py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95"
            >
              Train Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
