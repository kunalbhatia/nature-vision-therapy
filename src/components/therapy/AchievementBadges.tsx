import React, { useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaCrown, FaGamepad, FaRunning, FaCalendarCheck } from 'react-icons/fa';

interface Session {
  sessionType: string;
  completedAt: string;
  durationSeconds: number;
  score: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  type: 'streak' | 'total_sessions' | 'high_score' | 'total_time';
  category: 'patching' | 'games' | 'exercises';
  earned: boolean;
}

export default function AchievementBadges() {
  const [badges, setBadges] = useState<Badge[]>([
    { id: 'p-7', name: 'Patching Pro', description: '7 total patching sessions', icon: <FaCalendarCheck className="text-blue-500" />, requirement: 7, type: 'total_sessions', category: 'patching', earned: false },
    { id: 'p-30', name: 'Vision Hero', description: '30 total patching sessions', icon: <FaTrophy className="text-yellow-500" />, requirement: 30, type: 'total_sessions', category: 'patching', earned: false },
    { id: 'g-500', name: 'High Flyer', description: 'Score 500+ in any game', icon: <FaGamepad className="text-purple-500" />, requirement: 500, type: 'high_score', category: 'games', earned: false },
    { id: 'e-10', name: 'Active Eyes', description: '10 total eye exercises', icon: <FaRunning className="text-green-500" />, requirement: 10, type: 'total_sessions', category: 'exercises', earned: false },
    { id: 't-1000', name: 'Time Master', description: '1000 mins total patching', icon: <FaCrown className="text-orange-500" />, requirement: 1000, type: 'total_time', category: 'patching', earned: false },
    { id: 's-7', name: 'Week Streak', description: '7-day activity streak', icon: <FaStar className="text-yellow-400" />, requirement: 7, type: 'streak', category: 'patching', earned: false },
  ]);

  useEffect(() => {
    fetch('/api/get-all-sessions')
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          const history = data.history as Session[];
          
          const patchingSessions = history.filter(s => s.sessionType === 'patching');
          const exerciseSessions = history.filter(s => s.sessionType.includes('exercise') || ['brock_string', 'near_far', 'saccade', 'character_hunt'].includes(s.sessionType));
          
          const totalPatchingTime = patchingSessions.reduce((acc, s) => acc + (s.durationSeconds / 60), 0);
          const maxScore = history.reduce((max, s) => Math.max(max, s.score || 0), 0);

          setBadges(prev => prev.map(badge => {
            let earned = false;
            switch(badge.type) {
              case 'total_sessions':
                if (badge.category === 'patching') earned = patchingSessions.length >= badge.requirement;
                if (badge.category === 'exercises') earned = exerciseSessions.length >= badge.requirement;
                break;
              case 'high_score':
                earned = maxScore >= badge.requirement;
                break;
              case 'total_time':
                earned = totalPatchingTime >= badge.requirement;
                break;
              case 'streak':
                // Simple check for now, ideally needs a dedicated streak API
                earned = patchingSessions.length >= badge.requirement; 
                break;
            }
            return { ...badge, earned };
          }));
        }
      })
      .catch(err => console.error('Failed to fetch history for achievement badges:', err));
  }, []);

  return (
    <div className="w-full p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-3xl font-black text-gray-800 tracking-tight">Trophy Gallery</h3>
        <div className="badge badge-lg bg-yellow-100 text-yellow-700 border-yellow-200 py-4 px-6 font-bold">
          {badges.filter(b => b.earned).length} / {badges.length} Earned
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className={`group relative flex flex-col items-center p-6 rounded-[2rem] border-4 transition-all duration-300 transform hover:scale-105
              ${badge.earned 
                ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-lg' 
                : 'border-gray-50 bg-gray-50/50 opacity-40 grayscale'}`}
          >
            <div className={`text-5xl mb-4 transition-transform group-hover:rotate-12 ${badge.earned ? 'animate-bounce-short' : ''}`}>
              {badge.icon}
            </div>
            <h4 className="text-sm font-black text-gray-800 text-center mb-1">{badge.name}</h4>
            <p className="text-[10px] text-gray-500 text-center font-medium leading-tight">{badge.description}</p>
            
            {badge.earned && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-md animate-in fade-in zoom-in duration-500">
                EARNED
              </div>
            )}
            
            {!badge.earned && (
              <div className="mt-4 w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                <div className="bg-gray-400 h-full w-1/3"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
