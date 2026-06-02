import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-2xl max-w-2xl text-center backdrop-blur-sm">
      <h1 className="text-4xl font-bold text-green-800 mb-4">Welcome to Nature Vision Therapy</h1>
      <p className="text-lg text-gray-700 mb-8">
        A fun and engaging way to practice your vision therapy exercises. 
        Explore stories, play games, and track your progress!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Link to="/stories" className="btn btn-primary text-white">
          Read Stories
        </Link>
        <Link to="/therapy" className="btn btn-secondary text-white">
          Start Therapy
        </Link>
        <Link to="/dashboard" className="btn btn-accent text-white">
          View Dashboard
        </Link>
        <Link to="/settings" className="btn btn-ghost border-gray-300">
          Settings
        </Link>
      </div>
    </div>
  );
}
