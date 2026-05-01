import { useTranslation } from "react-i18next";
import { Menu, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/": "nav.dashboard",
  "/cash": "nav.cash",
  "/expenses": "nav.expenses",
  "/revenue": "nav.revenue",
  "/payroll": "nav.payroll",
  "/attendance": "nav.attendance",
  "/projects": "nav.projects",
  "/machines": "nav.machines",
  "/suppliers": "nav.suppliers",
  "/employees": "nav.employees",
  "/reports": "nav.reports",
  "/alerts": "nav.alerts",
  "/data-entry": "nav.data_entry",
  "/settings": "nav.settings",
};

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const titleKey = TITLES[pathname] ?? "nav.dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-base font-semibold tracking-tight md:text-lg">{t(titleKey)}</h1>

      <div className="relative mx-2 hidden flex-1 md:block">
        <Search
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          style={{ insetInlineStart: "0.75rem" }}
        />
        <Input
          className="h-9 max-w-md bg-surface ps-9"
          placeholder={t("topbar.search_placeholder")}
        />
      </div>

      <div className="ms-auto flex items-center gap-1">
        <LanguageSwitcher />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === "dark" ? t("topbar.theme_light") : t("topbar.theme_dark")}
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>
        <div className="ms-2 grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          RC
        </div>
      </div>
    </header>
  );
}