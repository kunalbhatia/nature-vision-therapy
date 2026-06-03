import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaHourglassHalf, FaGamepad, FaEye, FaCrosshairs, FaBolt, FaArrowLeft } from "react-icons/fa";
import PatchingTimer from "../components/therapy/PatchingTimer";
import StreakCalendar from "../components/therapy/StreakCalendar";
import AnaglyphBubblePop from "../components/games/AnaglyphBubblePop";
import ComplianceBadges from "../components/therapy/ComplianceBadges";
import DotTracing from "../components/exercises/DotTracing";
import NearFarFocus from "../components/exercises/NearFarFocus";
import CharacterHunt from "../components/exercises/CharacterHunt";
import SmoothPursuit from "../components/exercises/SmoothPursuit";
import SaccadeTraining from "../components/exercises/SaccadeTraining";
import AnaglyphSnake from "../components/games/AnaglyphSnake";
import BrockString from "../components/exercises/BrockString";

export default function TherapyPage() {
  const location = useLocation();
  const isBaseTherapy = location.pathname === "/therapy";

  const exercises = [
    { 
      path: "patching", 
      label: "Patching Timer", 
      gradient: "from-emerald-500 to-teal-600 shadow-emerald-500/20", 
      desc: "Track your daily patching", 
      icon: <FaHourglassHalf /> 
    },
    { 
      path: "anaglyph", 
      label: "Red-Blue Games", 
      gradient: "from-indigo-500 to-violet-600 shadow-indigo-500/20", 
      desc: "Games for both eyes", 
      icon: <FaGamepad /> 
    },
    { 
      path: "monocular", 
      label: "Right-Eye Exercises", 
      gradient: "from-rose-500 to-orange-600 shadow-rose-500/20", 
      desc: "Train your weaker eye", 
      icon: <FaEye /> 
    },
    { 
      path: "pursuit", 
      label: "Tracking Exercises", 
      gradient: "from-cyan-500 to-blue-600 shadow-cyan-500/20", 
      desc: "Follow moving targets", 
      icon: <FaCrosshairs /> 
    },
    { 
      path: "saccade", 
      label: "Saccade Training", 
      gradient: "from-amber-500 to-red-600 shadow-amber-500/20", 
      desc: "Quick eye movements", 
      icon: <FaBolt /> 
    },
    { 
      path: "brock-string", 
      label: "Virtual Brock String", 
      gradient: "from-indigo-600 to-blue-800 shadow-indigo-500/20", 
      desc: "Convergence training", 
      icon: <FaEye /> 
    },
    { 
      path: "snake", 
      label: "Anaglyph Snake", 
      gradient: "from-green-500 to-emerald-700 shadow-green-500/20", 
      desc: "Classic game for fusion", 
      icon: <FaGamepad /> 
    },
  ];

  return (
    <div className="w-full max-w-6xl p-6 bg-white/95 rounded-xl shadow-xl min-h-[60vh]">
      <h1 className="text-4xl font-black text-green-900 mb-8 tracking-tight">Vision Therapy Center</h1>

      {isBaseTherapy ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex) => (
            <Link 
              key={ex.path} 
              to={`/therapy/${ex.path}`} 
              className={`group p-6 rounded-3xl bg-gradient-to-br ${ex.gradient} shadow-lg hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex flex-col items-start gap-4 relative overflow-hidden`}
            >
              {/* Background Glow Pattern */}
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-6 translate-y-6 group-hover:scale-150 transition-all duration-500" />
              
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white text-2xl shadow-inner">
                {ex.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">{ex.label}</h3>
                <p className="text-sm text-white/90">{ex.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div>
          <Link to="/therapy" className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 transition-all font-bold text-sm">
            <FaArrowLeft /> Back to Therapy Center
          </Link>
          <div className="p-8 bg-gray-50/50 rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-100 min-h-[50vh]">
            <Outlet />
          </div>
        </div>
      )}
    </div>
  );
}

export function PatchingTimerPage() { 
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
      <PatchingTimer onComplete={() => setRefreshKey(prev => prev + 1)} />
      <div className="flex flex-col gap-6 w-full max-w-md">
        <StreakCalendar key={refreshKey} />
        <ComplianceBadges key={`badges-${refreshKey}`} />
      </div>
    </div>
  ); 
}

export function AnaglyphGamesPage() { 
  return <AnaglyphBubblePop />; 
}

export function MonocularExercisesPage() { 
  const [active, setActive] = useState<'dot' | 'near-far' | 'hunt' | null>(null);

  if (active === 'dot') return <DotTracing onComplete={() => setActive(null)} />;
  if (active === 'near-far') return <NearFarFocus onComplete={() => setActive(null)} />;
  if (active === 'hunt') return <CharacterHunt onComplete={() => setActive(null)} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <button onClick={() => setActive('dot')} className="btn btn-lg h-32 btn-primary rounded-3xl text-xl">Dot Tracing</button>
      <button onClick={() => setActive('near-far')} className="btn btn-lg h-32 btn-secondary rounded-3xl text-xl">Near-Far Focus</button>
      <button onClick={() => setActive('hunt')} className="btn btn-lg h-32 btn-accent rounded-3xl text-xl">Character Hunt</button>
    </div>
  );
}

export function PursuitExercisesPage() { 
  return <SmoothPursuit />; 
}

export function SaccadeTrainingPage() { 
  return <SaccadeTraining />; 
}

export function AnaglyphSnakePage() {
  return <AnaglyphSnake />;
}

export function BrockStringPage() {
  return <BrockString />;
}






