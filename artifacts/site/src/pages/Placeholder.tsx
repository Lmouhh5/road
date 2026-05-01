import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";

export default function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-elev-sm animate-fade-in-up">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
          <Construction className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{t(titleKey)}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary">{t("page.in_progress")}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t("page.coming_soon")}</p>
      </div>
    </div>
  );
}