import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const LANGS: { code: "fr" | "ar" | "en"; label: string; native: string }[] = [
  { code: "fr", label: "Français", native: "FR" },
  { code: "ar", label: "العربية",  native: "AR" },
  { code: "en", label: "English",  native: "EN" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language?.slice(0, 2) ?? "fr") as "fr" | "ar" | "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Languages className="h-4 w-4" />
          <span className="text-xs font-semibold tracking-wide">
            {LANGS.find((l) => l.code === current)?.native}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t("topbar.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={current === l.code ? "bg-accent text-accent-foreground" : ""}
          >
            <span className="me-2 inline-block w-7 text-xs font-mono font-semibold text-muted-foreground">
              {l.native}
            </span>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}