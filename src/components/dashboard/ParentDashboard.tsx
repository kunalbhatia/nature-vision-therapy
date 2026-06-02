import { useEffect, useState } from 'react';
import { FaFileDownload, FaCalendarAlt, FaHistory } from 'react-icons/fa';

interface Session {
  sessionType: string;
  durationSeconds: number;
  date: string;
  score: number;
  completedAt: string;
}

export default function ParentDashboard() {
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    fetch('/api/get-all-sessions')
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .catch(err => console.error('Failed to fetch history:', err));
  }, []);

  const totalPatchingMinutes = history
    .filter(s => s.sessionType === 'patching')
    .reduce((acc, s) => acc + (s.durationSeconds / 60), 0);

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Therapy Overview</h2>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 whitespace-nowrap">
          <FaFileDownload /> Export Progress Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Patching</h4>
          <span className="text-3xl font-black text-blue-600">{Math.round(totalPatchingMinutes)} mins</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Exercises Done</h4>
          <span className="text-3xl font-black text-green-600">{history.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Last Active</h4>
          <span className="text-xl font-bold text-gray-700">
            {history[0] ? new Date(history[0].completedAt).toLocaleDateString() : 'Never'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
