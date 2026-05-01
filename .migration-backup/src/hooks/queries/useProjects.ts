// Re-export the financial summary hook under a friendlier name for the
// Projects page. Uses the same view so `spent` and `margin` are computed
// server-side and stay consistent between Dashboard and Projects.
export { useProjectFinancialSummary as useProjects } from "./useProjectFinancialSummary";
