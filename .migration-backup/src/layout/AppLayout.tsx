import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useState } from "react";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Sidebar collapsed={collapsed} />
      <div
        className="flex min-h-screen flex-col transition-[padding] duration-300"
        style={{ paddingInlineStart: collapsed ? "4rem" : "15rem" }}
      >
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1480px] px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}