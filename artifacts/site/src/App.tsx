import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import NotFound from "./pages/NotFound.tsx";
import { AppLayout } from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import DataEntry from "./pages/DataEntry";
import Projects from "./pages/Projects";
import Expenses from "./pages/Expenses";
import Cash from "./pages/Cash";
import Revenue from "./pages/Revenue";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Payroll from "./pages/Payroll";
import Attendance from "./pages/Attendance";
import Machines from "./pages/Machines";
import Suppliers from "./pages/Suppliers";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Routis</h1>
          <p className="text-muted-foreground mt-1 text-sm">Construction financial control</p>
        </div>
        <button
          onClick={login}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Log in
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthGate>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cash"       element={<Cash />} />
              <Route path="/expenses"   element={<Expenses />} />
              <Route path="/revenue"    element={<Revenue />} />
              <Route path="/payroll"    element={<Payroll />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/projects"   element={<Projects />} />
              <Route path="/machines"   element={<Machines />} />
              <Route path="/suppliers"  element={<Suppliers />} />
              <Route path="/employees"  element={<Employees />} />
              <Route path="/reports"    element={<Reports />} />
              <Route path="/alerts"     element={<Alerts />} />
              <Route path="/data-entry" element={<DataEntry />} />
              <Route path="/settings"   element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
