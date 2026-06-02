import { useEffect, useState } from 'react';
import { FaFire } from 'react-icons/fa';

interface Session {
  date: string;
  durationMinutes: number;
  completed: boolean;
}

export default function StreakCalendar() {
  const [history, setHistory] = useState<Session[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch('/api/get-patching-history')
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setHistory(data.history);
          calculateStreak(data.history);
        }
      })
      .catch(err => console.error('Failed to fetch history:', err));
  }, []);

  const calculateStreak = (sessions: Session[]) => {
    if (sessions.length === 0) return setStreak(0);
    
    const dates = sessions
      .filter(s => s.completed)
      .map(s => s.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (dates.length === 0) return setStreak(0);

    let currentStreak = 0;
    const lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    // Check if the latest session was today or yesterday
    const latestDate = new Date(dates[0]);
    latestDate.setHours(0, 0, 0, 0);
    
    const diff = (lastDate.getTime() - latestDate.getTime()) / (1000 * 3600 * 24);
    
    if (diff > 1) return setStreak(0);

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      d.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(lastDate);
      expectedDate.setDate(lastDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (d.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else if (d.getTime() < expectedDate.getTime()) {
        break;
      }
    }
    setStreak(currentStreak);
  };

  // Generate last 30 days for the heatmap
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const getIntensity = (date: string) => {
    const session = history.find(s => s.date === date);
    if (!session) return 'bg-gray-100';
    if (session.completed) return 'bg-green-500';
    if (session.durationMinutes > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          Patching Streak
        </h3>
        <div className="flex items-center gap-1 text-orange-500 font-bold text-2xl">
          <FaFire /> {streak}
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {days.map(date => (
          <div 
            key={date} 
            className={`w-full aspect-square rounded-sm ${getIntensity(date)}`}
            title={`${date}: ${history.find(s => s.date === date)?.durationMinutes || 0} mins`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400 uppercase tracking-widest">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
