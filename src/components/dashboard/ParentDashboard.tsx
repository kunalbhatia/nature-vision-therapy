import { useEffect, useState, useMemo } from 'react';
import { FaFileDownload, FaCalendarAlt, FaHistory, FaBullseye, FaSave, FaChartLine } from 'react-icons/fa';
import { useSnackbar } from '../../hooks/Snackbar';
import ProgressChart from './ProgressChart';

interface Session {
  sessionType: string;
  durationSeconds: number;
  date: string;
  score: number;
  completedAt: string;
}

interface TherapyGoals {
  dailyPatchingMinutes: number;
  exercisesPerDay: number;
}

export default function ParentDashboard() {
  const [history, setHistory] = useState<Session[]>([]);
  const [goals, setGoals] = useState<TherapyGoals>({ dailyPatchingMinutes: 60, exercisesPerDay: 5 });
  const [isSaving, setIsSaving] = useState(false);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    fetch('/api/get-all-sessions')
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .catch(err => console.error('Failed to fetch history:', err));

    fetch('/api/get-progress-summary')
      .then(res => res.json())
      .then(data => {
        if (data.therapyGoals) setGoals(data.therapyGoals);
      })
      .catch(err => console.error('Failed to fetch goals:', err));
  }, []);

  const handleSaveGoals = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/update-user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapyGoals: goals })
      });
      const data = await res.json();
      showMessage(data.message, data.status);
    } catch {
      showMessage('Failed to save goals', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalPatchingMinutes = history
    .filter(s => s.sessionType === 'patching')
    .reduce((acc, s) => acc + (s.durationSeconds / 60), 0);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySessions = history.filter(s => s.completedAt.startsWith(date) && s.sessionType === 'patching');
      const totalMins = daySessions.reduce((acc, s) => acc + (s.durationSeconds / 60), 0);
      return {
        label: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        value: Math.round(totalMins)
      };
    });
  }, [history]);

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Therapy Overview</h2>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 whitespace-nowrap">
          <FaFileDownload /> Export Progress Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* Goals Customization */}
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-inner">
                <FaBullseye />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-900">Therapy Goals</h3>
                <p className="text-emerald-800/70 text-xs">Customize daily targets for your child.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Daily Patching (min)</label>
                <input 
                  type="number" 
                  value={goals.dailyPatchingMinutes}
                  onChange={(e) => setGoals({ ...goals, dailyPatchingMinutes: parseInt(e.target.value) || 0 })}
                  className="input input-bordered bg-white border-emerald-200 focus:border-emerald-500 rounded-xl w-32 font-bold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Daily Exercises</label>
                <input 
                  type="number" 
                  value={goals.exercisesPerDay}
                  onChange={(e) => setGoals({ ...goals, exercisesPerDay: parseInt(e.target.value) || 0 })}
                  className="input input-bordered bg-white border-emerald-200 focus:border-emerald-500 rounded-xl w-32 font-bold"
                />
              </div>
              <button 
                onClick={handleSaveGoals}
                disabled={isSaving}
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl px-6 flex items-center gap-2 shadow-lg"
              >
                {isSaving ? <span className="loading loading-spinner loading-sm"></span> : <FaSave />} Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Patching</span>
              <span className="text-2xl font-black text-blue-600">{Math.round(totalPatchingMinutes)}m</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Exercises</span>
              <span className="text-2xl font-black text-green-600">{history.length}</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Active</span>
              <span className="text-sm font-black text-gray-700">
                {history[0] ? new Date(history[0].completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Never'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2 text-gray-500">
            <FaChartLine />
            <span className="text-sm font-black uppercase tracking-widest">Patching Trends (Last 7 Days)</span>
          </div>
          <ProgressChart data={chartData} title="Daily Patching Minutes" color="#10b981" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <FaHistory className="text-blue-500" /> Recent Activity Log
          </h3>
          <FaCalendarAlt className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th>Date</th>
                <th>Activity</th>
                <th>Duration</th>
                <th>Status / Score</th>
              </tr>
            </thead>
            <tbody>
              {history.map((session, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="font-medium text-gray-600">
                    {new Date(session.completedAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="capitalize font-semibold text-gray-800">
                    {session.sessionType.replace('_', ' ')}
                  </td>
                  <td>{Math.round(session.durationSeconds / 60)} mins</td>
                  <td>
                    {session.sessionType === 'patching' ? (
                      <span className={`badge ${session.score > 0 ? 'badge-success' : 'badge-ghost'}`}>
                        {session.score > 0 ? 'Completed' : 'Partial'}
                      </span>
                    ) : (
                      <span className="font-bold text-blue-600">{session.score} pts</span>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">No activity recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
