import { Link } from "react-router-dom";

type HomePageProps = {
  readonly isLoggedIn: boolean;
};

export default function HomePage({ isLoggedIn }: HomePageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/95 rounded-3xl shadow-2xl max-w-3xl text-center backdrop-blur-md border border-green-100 animate-in fade-in zoom-in-95 duration-500">
      <h1 className="text-4xl font-black text-green-900 mb-2 tracking-tight">
        Welcome to Nature Vision Therapy
      </h1>
      <p className="text-base text-gray-600 mb-8 max-w-xl">
        A fun and engaging way to practice your vision therapy exercises. 
        Watch the video below to learn more about how vision therapy works!
      </p>

      {/* YouTube Video Container */}
      <div className="w-full mb-8 rounded-2xl overflow-hidden shadow-xl border-4 border-emerald-50">
        <iframe
          className="w-full aspect-video"
          src="https://www.youtube.com/embed/YIp8-g4FUqQ"
          title="What is Vision Therapy?"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      {/* Auth Actions or App Features Grid */}
      {!isLoggedIn ? (
        <div className="flex flex-wrap gap-4 justify-center w-full max-w-md">
          <Link
            to="/login"
            className="flex-1 min-w-[140px] px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-green-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="flex-1 min-w-[140px] px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            Register
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Link
            to="/stories"
            className="flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Read Stories
          </Link>
          <Link
            to="/therapy"
            className="flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Therapy
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center px-8 py-3.5 bg-green-800 hover:bg-green-750 text-white font-bold rounded-2xl shadow-lg shadow-green-800/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            View Dashboard
          </Link>
          <Link
            to="/personalize"
            className="flex items-center justify-center px-8 py-3.5 bg-green-800 hover:bg-green-750 text-white font-bold rounded-2xl shadow-lg shadow-green-800/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Personalize
          </Link>
        </div>
      )}
    </div>
  );
}
