import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Navbar from "./components/NavBar";
import { useSnackbar } from "./hooks/Snackbar";
import useAuthStatus from "./hooks/AuthStatus";
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
  SaccadeTrainingPage,
  AnaglyphSnakePage,
  BrockStringPage
} from "./pages/TherapyPage";
import PersonalizePage from "./pages/PersonalizePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const { showMessage } = useSnackbar();
  const { isLoggedIn: isAuthenticated, user } = useAuthStatus();
  const { showPreloader, hidePreloader } = usePreloader();

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
        className="min-h-screen flex flex-row w-full"
        style={{
          backgroundImage: "url(/trees.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Navbar
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
        
        <div className="flex-1 min-h-screen flex flex-col items-center overflow-x-hidden pt-16 md:pt-0">
          <main className="flex-1 w-full flex flex-col items-center p-4">
            <Routes>
              <Route
                path="/"
                element={<HomePage isLoggedIn={isLoggedIn} />}
              />
              <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              
              <Route path="/dashboard" element={<DashboardPage />}>
                <Route index element={<Navigate to="/dashboard/child" replace />} />
                <Route path="child" element={<ChildDashboard />} />
                <Route path="parent" element={<ParentDashboard />} />
              </Route>

              <Route path="/therapy" element={<TherapyPage />}>
                <Route path="patching" element={<PatchingTimerPage />} />
                <Route path="anaglyph" element={<AnaglyphGamesPage />} />
                <Route path="monocular" element={<MonocularExercisesPage />} />
                <Route path="pursuit" element={<PursuitExercisesPage />} />
                <Route path="saccade" element={<SaccadeTrainingPage />} />
                <Route path="brock-string" element={<BrockStringPage />} />
                <Route path="snake" element={<AnaglyphSnakePage />} />
              </Route>

              <Route path="/personalize" element={<PersonalizePage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <AdBanner isVisible={false} />
      </div>
    </BrowserRouter>
  );
}

export default App;
