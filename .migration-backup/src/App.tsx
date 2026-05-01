import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
