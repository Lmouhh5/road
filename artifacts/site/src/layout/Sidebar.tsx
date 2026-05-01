import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Wallet, Receipt, FileText, Users2, CalendarCheck,
  HardHat, Truck, Handshake, UserRound, BarChart3, AlertTriangle,
  PencilLine, Settings, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { collapsed: boolean; }

const groups = [
  { label: null, items: [{ to: "/", icon: LayoutDashboard, key: "dashboard", end: true }] },
  {
    label: "section_finance",
    items: [
      { to: "/cash",       icon: Wallet,        key: "cash" },
      { to: "/expenses",   icon: Receipt,       key: "expenses" },
      { to: "/revenue",    icon: FileText,      key: "revenue" },
      { to: "/payroll",    icon: Users2,        key: "payroll" },
      { to: "/attendance", icon: CalendarCheck, key: "attendance" },
    ],
  },
  {
    label: "section_operations",
    items: [
      { to: "/projects",  icon: HardHat,    key: "projects" },
      { to: "/machines",  icon: Truck,      key: "machines" },
      { to: "/suppliers", icon: Handshake,  key: "suppliers" },
      { to: "/employees", icon: UserRound,  key: "employees" },
    ],
  },
  {
    label: "section_analysis",
    items: [
      { to: "/reports", icon: BarChart3,      key: "reports" },
      { to: "/alerts",  icon: AlertTriangle,  key: "alerts" },
    ],
  },
  {
    label: "section_system",
    items: [
      { to: "/data-entry", icon: PencilLine, key: "data_entry" },
      { to: "/settings",   icon: Settings,   key: "settings" },
    ],
  },
] as const;

export function Sidebar({ collapsed }: Props) {
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 flex flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground shadow-elev-sm transition-[width] duration-300",
        collapsed ? "w-16" : "w-60",
      )}
      style={{ insetInlineStart: 0 }}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-elev-md">
          <Building2 className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-bold tracking-tight">{t("app.name")}</div>
            <div className="truncate text-[11px] text-muted-foreground">{t("app.tagline")}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((g, gi) => (
          <div key={gi} className="mb-3">
            {g.label && !collapsed && (
              <div className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                {t(`nav.${g.label}`)}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={"end" in item ? item.end : false}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                          collapsed && "justify-center px-0",
                        )
                      }
                      title={collapsed ? t(`nav.${item.key}`) : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              aria-hidden
                              className="absolute inset-y-1.5 w-[3px] rounded-full bg-primary"
                              style={{ insetInlineStart: 0 }}
                            />
                          )}
                          <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
                          {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 text-[11px] text-muted-foreground">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <span>v0.1 · prototype</span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">live</span>
          </div>
        ) : (
          <div className="text-center">·</div>
        )}
      </div>
    </aside>
  );
}