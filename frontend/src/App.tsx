import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectDashboardPage from "./pages/ProjectDashboardPage";
import ProjectTasks from "./pages/ProjectTasks";
import ProjectTeam from "./pages/ProjectTeam";
import ProjectActivity from "./pages/ProjectActivity";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Login />} />
            
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
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <ProjectDetail />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id/dashboard" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <ProjectDashboardPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id/tasks" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <ProjectTasks />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id/team" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <ProjectTeam />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id/activity" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <ProjectActivity />
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
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Profile />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Notifications />
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
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
