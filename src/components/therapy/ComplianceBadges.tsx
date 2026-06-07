import React, { useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaCrown } from 'react-icons/fa';

interface Session {
  completed: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number; // days of streak or total sessions
  earned: boolean;
}

export default function ComplianceBadges() {
  const [badges, setBadges] = useState<Badge[]>([
    { id: 's-7', name: '7-Day Star', description: 'Patching for 7 days straight!', icon: <FaStar className="text-yellow-400" />, requirement: 7, earned: false },
    { id: 'p-30', name: '30-Day Hero', description: 'A whole month of patching!', icon: <FaTrophy className="text-blue-400" />, requirement: 30, earned: false },
    { id: 't-1000', name: 'Time Master', description: 'The absolute master of vision!', icon: <FaCrown className="text-purple-500" />, requirement: 1000, earned: false },
  ]);

  useEffect(() => {
    fetch('/api/get-achievements')
      .then(res => res.json())
      .then(data => {
        if (data.badges) {
          const earnedStatus = data.badges as { id: string, earned: boolean }[];
          setBadges(prev => prev.map(badge => {
            const status = earnedStatus.find(s => s.id === badge.id);
            return { ...badge, earned: status ? status.earned : badge.earned };
          }));
        }
      })
      .catch(err => console.error('Failed to fetch history for badges:', err));
  }, []);

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Milestone Badges</h3>
      <div className="grid grid-cols-3 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${badge.earned ? 'border-yellow-200 bg-yellow-50 scale-105' : 'border-gray-100 bg-gray-50 opacity-50'}`}
          >
            <div className="text-4xl mb-2">{badge.icon}</div>
            <span className="text-[10px] font-bold text-center leading-tight">{badge.name}</span>
            {badge.earned && <div className="text-[8px] text-green-600 font-bold mt-1">EARNED</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
