import i18n from "@/i18n";

/** Format Algerian dinar values. Uses tabular numerals and group separators. */
export function formatDA(value: number, opts?: { compact?: boolean; signed?: boolean }) {
  const { compact = false, signed = false } = opts ?? {};
  const lng = i18n.language || "fr";
  const locale = lng === "ar" ? "ar-DZ" : lng === "en" ? "en-DZ" : "fr-DZ";
  const abs = Math.abs(value);
  const formatted = compact
    ? new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${formatted} DA`;
}

export function formatNumber(value: number) {
  const lng = i18n.language || "fr";
  const locale = lng === "ar" ? "ar-DZ" : lng === "en" ? "en-DZ" : "fr-DZ";
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPct(value: number, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatDate(value: string | Date, opts?: { withTime?: boolean }) {
  const lng = (typeof window !== "undefined" && document.documentElement.lang) || "fr";
  const locale = lng === "ar" ? "ar-DZ" : lng === "en" ? "en-DZ" : "fr-DZ";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "short", day: "2-digit",
    ...(opts?.withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

export function formatRelativeDays(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.round((Date.now() - d.getTime()) / 86_400_000);
  if (diff === 0) return "today";
  if (diff === 1) return "1d";
  return `${diff}d`;
}