import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DialogProvider } from './components/DialogProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import SplashScreen from './components/SplashScreen';
import UpdatePrompt from './components/UpdatePrompt';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import FutureGoal from './pages/FutureGoal';
import Profile from './pages/Profile';
import CourseFinder from './pages/CourseFinder';
import Institutions from './pages/Institutions';
import InstitutionDetail from './pages/InstitutionDetail';
import Careers from './pages/Careers';
import Funding from './pages/Funding';
import CostPlanner from './pages/CostPlanner';
import ApplicationTracker from './pages/ApplicationTracker';
import StudyResources from './pages/StudyResources';
import Wellness from './pages/Wellness';
import Streaks from './pages/Streaks';
import AICompanion from './pages/AICompanion';
import Settings from './pages/Settings';
import MatricUpgrade from './pages/MatricUpgrade';

/** Wrap a page with the app shell (sidebar, mobile nav, notifications). */
function Shell({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

/** Wizard pages don't use the shell — full-screen experience. */
function Bare({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem('nb_splash_seen') === '1';
  });

  function handleSplashDone() {
    sessionStorage.setItem('nb_splash_seen', '1');
    setSplashDone(true);
  }

  return (
    <AuthProvider>
      <DialogProvider>
      <DialogProvider>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Onboarding — full-screen, no shell */}
          <Route path="/onboarding" element={<Bare><Onboarding /></Bare>} />

          {/* Protected — normal shell */}
          <Route path="/dashboard"    element={<Shell><Dashboard /></Shell>} />
          <Route path="/roadmap"      element={<Shell><Roadmap /></Shell>} />
          <Route path="/future"       element={<Shell><FutureGoal /></Shell>} />
          <Route path="/profile"      element={<Shell><Profile /></Shell>} />
          <Route path="/courses"      element={<Shell><CourseFinder /></Shell>} />
          <Route path="/institutions" element={<Shell><Institutions /></Shell>} />
          <Route path="/institutions/:id" element={<Shell><InstitutionDetail /></Shell>} />
          <Route path="/careers"      element={<Shell><Careers /></Shell>} />
          <Route path="/funding"      element={<Shell><Funding /></Shell>} />
          <Route path="/cost-planner" element={<Shell><CostPlanner /></Shell>} />
          <Route path="/applications" element={<Shell><ApplicationTracker /></Shell>} />
          <Route path="/resources"    element={<Shell><StudyResources /></Shell>} />
          <Route path="/wellness"     element={<Shell><Wellness /></Shell>} />
          <Route path="/streaks"      element={<Shell><Streaks /></Shell>} />
          <Route path="/companion"    element={<Shell><AICompanion /></Shell>} />
          <Route path="/settings"     element={<Shell><Settings /></Shell>} />
          <Route path="/matric-upgrade" element={<Shell><MatricUpgrade /></Shell>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <UpdatePrompt />
      </BrowserRouter>
      </DialogProvider>
          </DialogProvider>
    </AuthProvider>
  );
}