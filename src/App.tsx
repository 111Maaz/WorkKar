import { useState, useEffect } from 'react';
import { Toaster } from "@/components/UI/toaster";
import { Toaster as Sonner } from "@/components/UI/sonner";
import { TooltipProvider } from "@/components/UI/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/Layout/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import WorkerProfilePage from "./pages/WorkerProfile";
import AdminRoutes from './admin';
import ProtectedRoute from './admin/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import WelcomeModal from '@/components/UI/WelcomeModal';

const queryClient = new QueryClient();

function AppRoutes({ handleShowHelp, handleResetWelcome, showWelcomeModal, setShowWelcomeModal }) {
  const location = useLocation();
  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar onShowHelp={handleShowHelp} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/worker/:id" element={<WorkerProfilePage />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer onResetWelcome={handleResetWelcome} />
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
    </>
  );
}

const App = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('workkar-welcome-seen');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleShowHelp = () => setShowWelcomeModal(true);
  const handleResetWelcome = () => {
    localStorage.removeItem('workkar-welcome-seen');
    setShowWelcomeModal(true);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes
                handleShowHelp={handleShowHelp}
                handleResetWelcome={handleResetWelcome}
                showWelcomeModal={showWelcomeModal}
                setShowWelcomeModal={setShowWelcomeModal}
              />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
