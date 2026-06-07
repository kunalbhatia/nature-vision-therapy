import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useSnackbar } from "../hooks/Snackbar";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto p-4">
      <div className="w-full bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-green-100 animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl font-black text-green-900 mb-6 text-center tracking-tight">Welcome Back!</h2>
        <LoginForm
          onLogin={() => {
            onLoginSuccess();
            navigate("/");
          }}
          onStatusUpdate={(message, status) => {
            showMessage(message, status);
          }}
        />
        <p className="mt-6 text-center text-sm text-gray-500 font-medium">
          Don&apos;t have an account?{" "}
          <button 
            onClick={() => navigate("/signup")}
            className="text-emerald-600 font-bold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
