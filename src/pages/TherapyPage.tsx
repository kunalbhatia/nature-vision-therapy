import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import PatchingTimer from "../components/therapy/PatchingTimer";
import StreakCalendar from "../components/therapy/StreakCalendar";
import AnaglyphBubblePop from "../components/games/AnaglyphBubblePop";
import ComplianceBadges from "../components/therapy/ComplianceBadges";
import DotTracing from "../components/exercises/DotTracing";
import NearFarFocus from "../components/exercises/NearFarFocus";
import CharacterHunt from "../components/exercises/CharacterHunt";
import SmoothPursuit from "../components/exercises/SmoothPursuit";
import SaccadeTraining from "../components/exercises/SaccadeTraining";

export default function TherapyPage() {
  const location = useLocation();
  const isBaseTherapy = location.pathname === "/therapy";

  const exercises = [
    { path: "patching", label: "Patching Timer", color: "btn-primary", desc: "Track your daily patching" },
    { path: "anaglyph", label: "Red-Blue Games", color: "btn-secondary", desc: "Games for both eyes" },
    { path: "monocular", label: "Right-Eye Exercises", color: "btn-accent", desc: "Train your weaker eye" },
    { path: "pursuit", label: "Tracking Exercises", color: "btn-info", desc: "Follow moving targets" },
    { path: "saccade", label: "Saccade Training", color: "btn-warning", desc: "Quick eye movements" },
  ];

  return (
    <div className="w-full max-w-6xl p-6 bg-white/95 rounded-xl shadow-xl min-h-[60vh]">
      <h1 className="text-4xl font-black text-green-900 mb-8 tracking-tight">Vision Therapy Center</h1>

      {isBaseTherapy ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex) => (
            <Link key={ex.path} to={`/therapy/${ex.path}`} className={`group p-6 rounded-3xl border-4 border-transparent hover:border-green-200 bg-white shadow-md hover:shadow-xl transition-all flex flex-col items-start gap-4`}>
               <div className={`w-12 h-12 rounded-2xl ${ex.color.replace('btn-', 'bg-')} flex items-center justify-center text-white text-2xl font-bold`}>
                 {ex.label[0]}
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700">{ex.label}</h3>
                 <p className="text-sm text-gray-500">{ex.desc}</p>
               </div>
            </Link>
          ))}
        </div>
      ) : (
        <div>
          <Link to="/therapy" className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-2xl text-gray-500 font-bold hover:bg-green-50 hover:text-green-700 transition-all">
            ← Back to Therapy Center
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






