import { Link, Outlet, useLocation } from "react-router-dom";
import ChildDashboard from "../components/dashboard/ChildDashboard";
import ParentDashboard from "../components/dashboard/ParentDashboard";

export default function DashboardPage() {
  const location = useLocation();

  return (
    <div className="w-full max-w-6xl p-6 bg-white/95 rounded-xl shadow-xl min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-black text-green-900 tracking-tight">Vision Progress</h1>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <Link 
            to="/dashboard/child" 
            className={`px-6 py-2 rounded-xl font-bold transition-all ${location.pathname.includes('/child') ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Child View
          </Link>
          <Link 
            to="/dashboard/parent" 
            className={`px-6 py-2 rounded-xl font-bold transition-all ${location.pathname.includes('/parent') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Parent View
          </Link>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Outlet />
      </div>
    </div>
  );
}

export { ChildDashboard, ParentDashboard };

