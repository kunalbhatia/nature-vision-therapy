import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Navbar from "./components/NavBar";
import Modal from "./components/Modal";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import { useSnackbar } from "./hooks/Snackbar";
import useAuthStatus from "./hooks/AuthStatus";
import Personalization from "./components/Personalization";
import { usePreloader } from "./hooks/Preloader";
import AdBanner from "./components/AdBanner";

// Pages
import HomePage from "./pages/HomePage";
import StoriesPage from "./pages/StoriesPage";
import DashboardPage, { ChildDashboard, ParentDashboard } from "./pages/DashboardPage";
import TherapyPage, { 
  PatchingTimerPage, 
  AnaglyphGamesPage, 
  MonocularExercisesPage, 
  PursuitExercisesPage, 
  SaccadeTrainingPage 
} from "./pages/TherapyPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const { showMessage } = useSnackbar();
  const { isLoggedIn: isAuthenticated, user } = useAuthStatus();
  const { showPreloader, hidePreloader } = usePreloader();
  const [modalType, setModalType] = useState<
    "login" | "signup" | "personalize" | null
  >(null);

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      console.log("User:", user);
    }
  }, [user]);

  const handleLogout = () => {
    showPreloader();
    fetch("/api/logout", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        showMessage(data.message || "Logged out", data.status);
        setIsLoggedIn(false);
      })
      .catch((err) => {
        console.error("Logout error:", err);
        showMessage("Logout failed", "error");
      })
      .finally(() => {
        hidePreloader();
      });
  };

  return (
    <BrowserRouter>
      <div
        className="min-h-screen flex flex-col items-center"
        style={{
          backgroundImage: "url(/trees.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Navbar
          onLogin={() => setModalType("login")}
          onLogout={handleLogout}
          onConfigure={() => setModalType("personalize")}
          onSignup={() => setModalType("signup")}
          isLoggedIn={isLoggedIn}
        />
        
        <main className="flex-1 w-full flex flex-col items-center p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stories" element={<StoriesPage />} />
            
            <Route path="/dashboard" element={<DashboardPage />}>
              <Route path="child" element={<ChildDashboard />} />
              <Route path="parent" element={<ParentDashboard />} />
            </Route>

            <Route path="/therapy" element={<TherapyPage />}>
              <Route path="patching" element={<PatchingTimerPage />} />
              <Route path="anaglyph" element={<AnaglyphGamesPage />} />
              <Route path="monocular" element={<MonocularExercisesPage />} />
              <Route path="pursuit" element={<PursuitExercisesPage />} />
              <Route path="saccade" element={<SaccadeTrainingPage />} />
            </Route>

            <Route path="/settings" element={<SettingsPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {modalType === "login" && (
          <Modal title="Login" onClose={() => setModalType(null)}>
            <LoginForm
              onLogin={() => setModalType(null)}
              onStatusUpdate={(message, status) => {
                if (status === "success") setIsLoggedIn(true);
                showMessage(message, status);
              }}
            />
          </Modal>
        )}
        {modalType === "signup" && (
          <Modal title="Sign Up" onClose={() => setModalType(null)}>
            <SignupForm
              onSignup={() => setModalType(null)}
              onStatusUpdate={(message, status) => showMessage(message, status)}
            />
          </Modal>
        )}
        {modalType === "personalize" && (
          <Modal title="Personalization" onClose={() => setModalType(null)}>
            <Personalization onSave={() => setModalType(null)} />
          </Modal>
        )}
        <AdBanner isVisible={false} />
      </div>
    </BrowserRouter>
  );
}

export default App;

