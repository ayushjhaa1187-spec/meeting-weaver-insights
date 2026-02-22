import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Upload from "./pages/Upload";
import BrdGenerate from "./pages/BrdGenerate";
import BrdList from "./pages/BrdList";
import Metrics from "./pages/Metrics";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout />;
}

// Redirect authenticated users from landing page to dashboard
function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute />} />
          <Route path="/auth" element={<Auth />} />

          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<Index />} />
            <Route path="upload" element={<Upload />} />
            <Route path="brds" element={<BrdList />} />
            <Route path="brds/generate/:projectId" element={<BrdGenerate />} />
            <Route path="brds/:id" element={<BrdGenerate />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Legacy Redirects or Fallbacks */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
