import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth routes without sidebar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected app routes with sidebar */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Projects />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Tasks />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/time" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
