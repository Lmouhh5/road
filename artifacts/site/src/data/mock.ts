/** Mock dataset for the Routis prototype. Realistic Algerian road-construction figures (DA). */

export type ProjectStatus = "on_track" | "at_risk" | "delayed";

export interface ProjectRow {
  id: string;
  code: string;
  name: string;
  budget: number;
  spent: number;
  margin: number; // percentage points
  status: ProjectStatus;
}

export const projects: ProjectRow[] = [
  { id: "p1", code: "RN1-AÏN",  name: "RN1 — Aïn Defla, Section 4",     budget: 184_000_000, spent: 121_400_000, margin: 14.2, status: "on_track" },
  { id: "p2", code: "CW42-MED", name: "CW42 — Médéa Reprofilage",       budget: 92_500_000,  spent: 78_900_000,  margin: 7.8,  status: "at_risk"  },
  { id: "p3", code: "RN6-BLD",  name: "RN6 — Boulevard Blida Sud",      budget: 156_700_000, spent: 64_300_000,  margin: 18.5, status: "on_track" },
  { id: "p4", code: "CW17-TIP", name: "CW17 — Tipaza Échangeur",        budget: 68_300_000,  spent: 65_120_000,  margin: 3.1,  status: "delayed"  },
  { id: "p5", code: "RN5-BJA",  name: "RN5 — Béjaïa Asphalte",          budget: 211_000_000, spent: 142_800_000, margin: 11.4, status: "on_track" },
  { id: "p6", code: "RN18-CHL", name: "RN18 — Chlef Drainage",          budget: 47_900_000,  spent: 22_400_000,  margin: 21.7, status: "on_track" },
  { id: "p7", code: "CW09-BOU", name: "CW09 — Boumerdès Réhabilitation", budget: 134_200_000, spent: 109_600_000, margin: 9.6,  status: "at_risk" },
];

export interface MonthlyCash {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export const monthlyCashflow: MonthlyCash[] = [
  { month: "M-5", revenue: 78_400_000,  expenses: 62_100_000, profit: 16_300_000 },
  { month: "M-4", revenue: 92_700_000,  expenses: 81_300_000, profit: 11_400_000 },
  { month: "M-3", revenue: 104_200_000, expenses: 88_600_000, profit: 15_600_000 },
  { month: "M-2", revenue: 88_900_000,  expenses: 79_400_000, profit:  9_500_000 },
  { month: "M-1", revenue: 117_300_000, expenses: 94_200_000, profit: 23_100_000 },
  { month: "M",   revenue: 128_600_000, expenses: 102_700_000, profit: 25_900_000 },
];

export interface ExpenseSlice {
  key: string;
  value: number;
}

export const expenseDistribution: ExpenseSlice[] = [
  { key: "fuel",           value: 24_300_000 },
  { key: "labor",          value: 31_700_000 },
  { key: "materials",      value: 22_900_000 },
  { key: "repairs",        value:  9_800_000 },
  { key: "transport",      value:  6_200_000 },
  { key: "subcontracting", value:  5_400_000 },
  { key: "other",          value:  2_400_000 },
];

/** Sparkline series — small arrays for KPI cards. */
export const sparks = {
  revenue:      [78, 93, 104, 89, 117, 128].map((v, i) => ({ i, v })),
  expenses:     [62, 81,  89, 79,  94, 103].map((v, i) => ({ i, v })),
  profit:       [16, 11,  16,  9,  23,  26].map((v, i) => ({ i, v })),
  uncleared:    [12, 14,  11, 18,  16,  19].map((v, i) => ({ i, v })),
  missingProof: [ 4,  6,   5,  8,   7,   9].map((v, i) => ({ i, v })),
};

export const kpis = {
  revenue:      { value: 128_600_000, delta:  9.6 },
  expenses:     { value: 102_700_000, delta:  9.0 },
  profit:      { value: 25_900_000,  delta: 12.1 },
  uncleared:    { value: 19_400_000,  delta: 18.3 },
  missingProof: { value: 9, delta: 28.6 },
};

export const alertSummary = {
  uncleared: 5,
  missingProof: 9,
  overdue: 4,
  fuel: 3,
};

/* ---------- Suppliers, Employees, Categories ---------- */

export const suppliers = [
  { id: "s1", name: "Naftal SPA",                category: "fuel" },
  { id: "s2", name: "ENOF Bitumes",              category: "materials" },
  { id: "s3", name: "GICA Ciment",               category: "materials" },
  { id: "s4", name: "Sarl Granulats Médéa",      category: "materials" },
  { id: "s5", name: "Atelier Mécanique Bouira",  category: "repairs" },
  { id: "s6", name: "Transport Hadj Ali",        category: "transport" },
  { id: "s7", name: "STP Travaux Publics",       category: "subcontracting" },
  { id: "s8", name: "Quincaillerie El Affroun",  category: "other" },
] as const;

export const employees = [
  { id: "e1", name: "Mohamed Benali",       role: "Chef de chantier" },
  { id: "e2", name: "Karim Boudjedra",      role: "Caissier" },
  { id: "e3", name: "Yacine Hamidi",        role: "Conducteur" },
  { id: "e4", name: "Saïd Mansouri",        role: "Mécanicien" },
  { id: "e5", name: "Rachid Khelifi",       role: "Topographe" },
  { id: "e6", name: "Nadir Saadi",          role: "Magasinier" },
] as const;

export const expenseCategoryKeys = [
  "fuel", "labor", "materials", "repairs", "transport", "subcontracting", "other",
] as const;
export type ExpenseCategory = typeof expenseCategoryKeys[number];

/* ---------- Expense ledger ---------- */

export type PaymentMethod = "cash" | "bank" | "credit";
export type ProofStatus = "ok" | "missing" | "pending";

export interface ExpenseRow {
  id: string;
  date: string;          // ISO
  projectId: string;
  category: ExpenseCategory;
  supplierId: string;
  description: string;
  amount: number;        // DA
  method: PaymentMethod;
  proof: ProofStatus;
  paidBy: string;        // employee id
}

function d(daysAgo: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString();
}

export const expenses: ExpenseRow[] = [
  { id: "x1",  date: d(0),  projectId: "p1", category: "fuel",          supplierId: "s1", description: "Gazole — flotte camions", amount: 1_240_000, method: "cash",   proof: "missing", paidBy: "e2" },
  { id: "x2",  date: d(0),  projectId: "p3", category: "materials",     supplierId: "s2", description: "Bitume 35/50 — 18 t",     amount: 4_860_000, method: "bank",   proof: "ok",      paidBy: "e2" },
  { id: "x3",  date: d(1),  projectId: "p2", category: "labor",         supplierId: "s7", description: "Équipe pose enrobé",      amount: 2_310_000, method: "bank",   proof: "ok",      paidBy: "e1" },
  { id: "x4",  date: d(1),  projectId: "p5", category: "repairs",       supplierId: "s5", description: "Réparation finisseur",    amount:   712_000, method: "credit", proof: "pending", paidBy: "e4" },
  { id: "x5",  date: d(2),  projectId: "p4", category: "transport",     supplierId: "s6", description: "Acheminement granulats",  amount:   528_000, method: "cash",   proof: "ok",      paidBy: "e3" },
  { id: "x6",  date: d(2),  projectId: "p1", category: "materials",     supplierId: "s4", description: "Granulats 0/31.5 — 60 t", amount: 1_980_000, method: "bank",   proof: "ok",      paidBy: "e6" },
  { id: "x7",  date: d(3),  projectId: "p7", category: "fuel",          supplierId: "s1", description: "Gasoil — engins",         amount:   967_000, method: "cash",   proof: "missing", paidBy: "e2" },
  { id: "x8",  date: d(3),  projectId: "p6", category: "labor",         supplierId: "s7", description: "Maçons coffrage",         amount: 1_445_000, method: "bank",   proof: "ok",      paidBy: "e1" },
  { id: "x9",  date: d(4),  projectId: "p3", category: "subcontracting",supplierId: "s7", description: "Marquage horizontal",     amount: 3_120_000, method: "bank",   proof: "ok",      paidBy: "e1" },
  { id: "x10", date: d(5),  projectId: "p2", category: "repairs",       supplierId: "s5", description: "Pneus camion benne",      amount:   486_000, method: "credit", proof: "pending", paidBy: "e4" },
  { id: "x11", date: d(6),  projectId: "p5", category: "fuel",          supplierId: "s1", description: "Carburant compacteurs",   amount:   874_000, method: "cash",   proof: "missing", paidBy: "e2" },
  { id: "x12", date: d(7),  projectId: "p1", category: "other",         supplierId: "s8", description: "Petit outillage",         amount:   142_000, method: "cash",   proof: "ok",      paidBy: "e6" },
  { id: "x13", date: d(8),  projectId: "p7", category: "materials",     supplierId: "s3", description: "Ciment CPJ 42.5 — 24 t",  amount: 2_640_000, method: "bank",   proof: "ok",      paidBy: "e6" },
  { id: "x14", date: d(9),  projectId: "p4", category: "labor",         supplierId: "s7", description: "Équipe terrassement",     amount: 1_870_000, method: "bank",   proof: "ok",      paidBy: "e1" },
  { id: "x15", date: d(10), projectId: "p3", category: "transport",     supplierId: "s6", description: "Camion 8x4 location",     amount:   620_000, method: "cash",   proof: "missing", paidBy: "e2" },
  { id: "x16", date: d(12), projectId: "p1", category: "materials",     supplierId: "s2", description: "Émulsion bitumineuse",    amount: 1_330_000, method: "bank",   proof: "ok",      paidBy: "e6" },
  { id: "x17", date: d(14), projectId: "p6", category: "repairs",       supplierId: "s5", description: "Vidange — 4 engins",      amount:   388_000, method: "cash",   proof: "ok",      paidBy: "e4" },
  { id: "x18", date: d(16), projectId: "p2", category: "fuel",          supplierId: "s1", description: "Gazole stock chantier",   amount:   745_000, method: "cash",   proof: "missing", paidBy: "e2" },
  { id: "x19", date: d(18), projectId: "p5", category: "subcontracting",supplierId: "s7", description: "Étude géotechnique",      amount: 2_280_000, method: "bank",   proof: "ok",      paidBy: "e5" },
  { id: "x20", date: d(21), projectId: "p7", category: "other",         supplierId: "s8", description: "Équipement de sécurité",  amount:   312_000, method: "bank",   proof: "ok",      paidBy: "e6" },
];

/* ---------- Per-project monthly spend & extra metadata ---------- */

export interface ProjectMeta {
  id: string;
  client: string;
  manager: string;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  location: string;
}

export const projectMeta: Record<string, ProjectMeta> = {
  p1: { id: "p1", client: "Wilaya d'Aïn Defla",     manager: "M. Benali",   startDate: "2025-01-15", endDate: "2026-08-30", progress: 62, location: "Aïn Defla" },
  p2: { id: "p2", client: "DTP Médéa",              manager: "K. Boudjedra",startDate: "2024-09-01", endDate: "2025-12-15", progress: 78, location: "Médéa" },
  p3: { id: "p3", client: "APC Blida",              manager: "M. Benali",   startDate: "2025-03-10", endDate: "2026-11-20", progress: 38, location: "Blida" },
  p4: { id: "p4", client: "Wilaya de Tipaza",       manager: "Y. Hamidi",   startDate: "2024-11-05", endDate: "2025-09-30", progress: 92, location: "Tipaza" },
  p5: { id: "p5", client: "DTP Béjaïa",             manager: "M. Benali",   startDate: "2025-02-20", endDate: "2026-12-10", progress: 54, location: "Béjaïa" },
  p6: { id: "p6", client: "ANA Chlef",              manager: "R. Khelifi",  startDate: "2025-05-12", endDate: "2026-04-22", progress: 28, location: "Chlef" },
  p7: { id: "p7", client: "Wilaya de Boumerdès",    manager: "Y. Hamidi",   startDate: "2024-12-08", endDate: "2026-02-18", progress: 71, location: "Boumerdès" },
};

/** 6 month spend per project (DA, in millions for compactness) */
export const projectSpendTrend: Record<string, number[]> = {
  p1: [12, 18, 22, 19, 24, 26],
  p2: [11, 13, 14, 12, 14, 15],
  p3: [ 6,  8, 10, 11, 14, 15],
  p4: [ 9, 11, 12, 11, 11, 11],
  p5: [18, 22, 25, 24, 26, 28],
  p6: [ 2,  3,  4,  4,  5,  4],
  p7: [14, 17, 19, 18, 20, 22],
};

/* ---------- Recent activity feed (data entry page) ---------- */

export interface ActivityItem {
  id: string;
  kind: "expense" | "revenue" | "cash_in" | "cash_out" | "attendance";
  label: string;
  amount?: number;
  at: string;
  by: string;
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", kind: "expense",   label: "Gazole — RN1 Section 4",         amount: 1_240_000, at: d(0), by: "K. Boudjedra" },
  { id: "a2", kind: "revenue",   label: "Décompte — DTP Médéa",           amount: 8_400_000, at: d(0), by: "Compta" },
  { id: "a3", kind: "cash_out",  label: "Avance Caissier RN6",            amount: 600_000,   at: d(1), by: "K. Boudjedra" },
  { id: "a4", kind: "attendance",label: "Pointage équipe Blida (24)",                          at: d(1), by: "M. Benali" },
  { id: "a5", kind: "expense",   label: "Bitume 35/50 — 18 t",             amount: 4_860_000, at: d(1), by: "Compta" },
  { id: "a6", kind: "cash_in",   label: "Versement bancaire CPA",          amount: 12_000_000,at: d(2), by: "Compta" },
  { id: "a7", kind: "expense",   label: "Réparation finisseur",            amount: 712_000,   at: d(2), by: "S. Mansouri" },
];

/* ---------- Cash holders & movements ---------- */

export interface CashHolder {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  balance: number;       // current DA in hand
  lastClearedAt: string; // ISO
  projectId?: string;
  status: "ok" | "at_risk" | "overdue";
}

export const cashHolders: CashHolder[] = [
  { id: "h1", employeeId: "e2", name: "Karim Boudjedra", role: "Caissier central",      balance:  4_820_000, lastClearedAt: d(2),  projectId: "p1", status: "ok" },
  { id: "h2", employeeId: "e1", name: "Mohamed Benali",  role: "Chef chantier RN1",     balance:  1_240_000, lastClearedAt: d(7),  projectId: "p1", status: "at_risk" },
  { id: "h3", employeeId: "e3", name: "Yacine Hamidi",   role: "Conducteur Tipaza",     balance:    680_000, lastClearedAt: d(11), projectId: "p4", status: "overdue" },
  { id: "h4", employeeId: "e5", name: "Rachid Khelifi",  role: "Topographe Chlef",      balance:    320_000, lastClearedAt: d(4),  projectId: "p6", status: "ok" },
  { id: "h5", employeeId: "e6", name: "Nadir Saadi",     role: "Magasinier Béjaïa",     balance:    910_000, lastClearedAt: d(9),  projectId: "p5", status: "at_risk" },
  { id: "h6", employeeId: "e4", name: "Saïd Mansouri",   role: "Mécanicien atelier",    balance:    150_000, lastClearedAt: d(3),  projectId: "p2", status: "ok" },
];

export type CashDirection = "in" | "out";
export interface CashMove {
  id: string;
  date: string;
  holderId: string;
  direction: CashDirection;
  amount: number;
  reason: string;
  reference?: string;
}

export const cashMovements: CashMove[] = [
  { id: "c1",  date: d(0),  holderId: "h1", direction: "in",  amount: 6_000_000, reason: "Retrait bancaire CPA",        reference: "B-44218" },
  { id: "c2",  date: d(0),  holderId: "h1", direction: "out", amount:   600_000, reason: "Avance Caissier RN6",          reference: "RN6-AV12" },
  { id: "c3",  date: d(1),  holderId: "h2", direction: "out", amount:   240_000, reason: "Achat carburant urgence",      reference: "TKT-882" },
  { id: "c4",  date: d(1),  holderId: "h3", direction: "out", amount:   180_000, reason: "Petit outillage Tipaza" },
  { id: "c5",  date: d(2),  holderId: "h1", direction: "in",  amount: 3_500_000, reason: "Apport caisse mensuel" },
  { id: "c6",  date: d(2),  holderId: "h5", direction: "out", amount:   420_000, reason: "Réparation pneumatique" },
  { id: "c7",  date: d(3),  holderId: "h4", direction: "out", amount:   140_000, reason: "Frais déplacement équipe" },
  { id: "c8",  date: d(4),  holderId: "h1", direction: "out", amount: 1_240_000, reason: "Régularisation gazole RN1" },
  { id: "c9",  date: d(5),  holderId: "h2", direction: "out", amount:   310_000, reason: "Repas équipe terrain" },
  { id: "c10", date: d(6),  holderId: "h6", direction: "out", amount:    95_000, reason: "Pièces atelier" },
  { id: "c11", date: d(7),  holderId: "h1", direction: "in",  amount: 4_000_000, reason: "Retrait bancaire BNA" },
  { id: "c12", date: d(8),  holderId: "h3", direction: "out", amount:   220_000, reason: "Transport granulats" },
  { id: "c13", date: d(10), holderId: "h5", direction: "out", amount:   380_000, reason: "Avance fournisseur local" },
  { id: "c14", date: d(12), holderId: "h2", direction: "out", amount:   460_000, reason: "Frais divers chantier" },
];

/** 30-day cash position (DA, in millions) */
export const cashDailyBalance = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const base = 8 + Math.sin(i / 3) * 1.6 + i * 0.18;
  return {
    date: d(day).slice(0, 10),
    bank:  +(base * 6.4).toFixed(2),
    cash:  +(base * 1.1).toFixed(2),
  };
});

/* ---------- Revenue & Invoices ---------- */

export type InvoiceStatus = "paid" | "partial" | "pending" | "overdue";
export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  projectId: string;
  client: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
}

export const invoices: Invoice[] = [
  { id: "i1",  number: "FA-2025-0142", date: d(2),  dueDate: d(-28), projectId: "p1", client: "Wilaya d'Aïn Defla",  amount: 18_400_000, paid: 18_400_000, status: "paid"    },
  { id: "i2",  number: "FA-2025-0141", date: d(6),  dueDate: d(-24), projectId: "p3", client: "APC Blida",            amount: 22_800_000, paid: 12_000_000, status: "partial" },
  { id: "i3",  number: "FA-2025-0140", date: d(9),  dueDate: d(-21), projectId: "p5", client: "DTP Béjaïa",           amount: 31_200_000, paid:          0, status: "pending" },
  { id: "i4",  number: "FA-2025-0139", date: d(14), dueDate: d(-16), projectId: "p2", client: "DTP Médéa",            amount: 14_700_000, paid: 14_700_000, status: "paid"    },
  { id: "i5",  number: "FA-2025-0138", date: d(22), dueDate: d(-8),  projectId: "p7", client: "Wilaya de Boumerdès",  amount: 19_600_000, paid:  9_800_000, status: "partial" },
  { id: "i6",  number: "FA-2025-0137", date: d(34), dueDate: d(4),   projectId: "p4", client: "Wilaya de Tipaza",     amount:  8_900_000, paid:          0, status: "overdue" },
  { id: "i7",  number: "FA-2025-0136", date: d(40), dueDate: d(10),  projectId: "p1", client: "Wilaya d'Aïn Defla",   amount: 12_300_000, paid: 12_300_000, status: "paid"    },
  { id: "i8",  number: "FA-2025-0135", date: d(48), dueDate: d(18),  projectId: "p6", client: "ANA Chlef",            amount:  6_400_000, paid:          0, status: "overdue" },
  { id: "i9",  number: "FA-2025-0134", date: d(55), dueDate: d(25),  projectId: "p3", client: "APC Blida",            amount: 11_900_000, paid: 11_900_000, status: "paid"    },
  { id: "i10", number: "FA-2025-0133", date: d(62), dueDate: d(32),  projectId: "p5", client: "DTP Béjaïa",           amount: 27_800_000, paid: 27_800_000, status: "paid"    },
  { id: "i11", number: "FA-2025-0132", date: d(70), dueDate: d(40),  projectId: "p7", client: "Wilaya de Boumerdès",  amount: 16_200_000, paid: 16_200_000, status: "paid"    },
  { id: "i12", number: "FA-2025-0131", date: d(80), dueDate: d(50),  projectId: "p2", client: "DTP Médéa",            amount:  9_800_000, paid:  4_900_000, status: "partial" },
];

/** Monthly revenue trend (DA, in millions) */
export const monthlyRevenue = [
  { month: "M-5", invoiced: 78,  collected: 71 },
  { month: "M-4", invoiced: 92,  collected: 84 },
  { month: "M-3", invoiced: 104, collected: 96 },
  { month: "M-2", invoiced: 88,  collected: 82 },
  { month: "M-1", invoiced: 117, collected: 102 },
  { month: "M",   invoiced: 128, collected: 109 },
];

/* ---------- Alerts & Leaks ---------- */

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertKind =
  | "missing_proof"
  | "uncleared_advance"
  | "fuel_anomaly"
  | "budget_overrun"
  | "overdue_invoice"
  | "duplicate_expense"
  | "supplier_spike";

export interface AlertItem {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  detail: string;
  amount?: number;
  projectId?: string;
  at: string;
  status: "open" | "ack" | "resolved";
}

export const alerts: AlertItem[] = [
  { id: "al1",  kind: "fuel_anomaly",     severity: "critical", title: "Surconsommation gazole — RN1",        detail: "Conso/km 38% au-dessus de la moyenne flotte", amount: 1_240_000, projectId: "p1", at: d(0), status: "open" },
  { id: "al2",  kind: "uncleared_advance",severity: "critical", title: "Avance non régularisée 11j",           detail: "Y. Hamidi — Tipaza, dépasse seuil 7j",        amount:   680_000, projectId: "p4", at: d(0), status: "open" },
  { id: "al3",  kind: "budget_overrun",   severity: "high",     title: "Budget consommé 95% — CW17 Tipaza",    detail: "Reste 3.2 M DA pour 18% du planning",                            projectId: "p4", at: d(1), status: "open" },
  { id: "al4",  kind: "missing_proof",    severity: "high",     title: "9 dépenses sans pièce justificative",   detail: "Total impacté: 4.7 M DA — 30 derniers jours", amount: 4_700_000,                  at: d(1), status: "open" },
  { id: "al5",  kind: "overdue_invoice",  severity: "high",     title: "Facture FA-2025-0138 en retard",        detail: "Wilaya Boumerdès — 8j de retard",             amount: 9_800_000, projectId: "p7", at: d(1), status: "ack" },
  { id: "al6",  kind: "duplicate_expense",severity: "medium",   title: "Doublon probable — Bitume 35/50",       detail: "Deux saisies à 4.86 M DA, même jour",         amount: 4_860_000, projectId: "p3", at: d(2), status: "open" },
  { id: "al7",  kind: "supplier_spike",   severity: "medium",   title: "Hausse fournisseur — Naftal",           detail: "+42% vs moyenne 6 mois",                      amount: 3_080_000,                  at: d(2), status: "open" },
  { id: "al8",  kind: "missing_proof",    severity: "medium",   title: "Pièce manquante — Gazole 745k DA",      detail: "Saisie il y a 16 jours, aucun reçu",          amount:   745_000, projectId: "p2", at: d(3), status: "open" },
  { id: "al9",  kind: "uncleared_advance",severity: "medium",   title: "Avance Magasinier — 9j ouverts",        detail: "N. Saadi — Béjaïa, seuil 7j",                 amount:   910_000, projectId: "p5", at: d(3), status: "open" },
  { id: "al10", kind: "overdue_invoice",  severity: "low",      title: "Facture FA-2025-0137 — proche échéance",detail: "ANA Chlef — échéance dans 4j",                amount: 6_400_000, projectId: "p6", at: d(4), status: "open" },
  { id: "al11", kind: "fuel_anomaly",     severity: "low",      title: "Variabilité conso — finisseur RN5",     detail: "Écart-type doublé sur 7 derniers jours",                          projectId: "p5", at: d(5), status: "ack" },
  { id: "al12", kind: "budget_overrun",   severity: "high",     title: "Budget 85% — CW42 Médéa",              detail: "Marge restante 7.8% — risque dépassement",                       projectId: "p2", at: d(6), status: "open" },
];

/** 30-day alert volume by severity for the trend chart */
export const alertTrend = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const wave = Math.sin(i / 4) * 1.2 + 1.4;
  return {
    date: d(day).slice(5, 10),
    critical: Math.max(0, Math.round(wave * 0.7 + (i % 7 === 0 ? 1 : 0))),
    high:     Math.max(0, Math.round(wave * 1.3 + (i % 5 === 0 ? 1 : 0))),
    medium:   Math.max(1, Math.round(wave * 1.8 + 1)),
    low:      Math.max(1, Math.round(wave * 2.1 + 2)),
  };
});

/** Estimated leakage (DA) by category — 30 days */
export const leakByCategory = [
  { key: "fuel",           value:  3_840_000 },
  { key: "missing_proof",  value:  4_700_000 },
  { key: "uncleared",      value:  2_590_000 },
  { key: "duplicates",     value:  1_120_000 },
  { key: "supplier_spike", value:  3_080_000 },
];

/* ---------- Payroll ---------- */

export type PayrollStatus = "draft" | "validated" | "paid";

export interface PayrollLine {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  projectId: string;
  baseSalary: number;
  daysWorked: number;
  daysPlanned: number;
  bonuses: number;
  advances: number;
  deductions: number;
  net: number;
  status: PayrollStatus;
}

const _payBase = (base: number, days: number, planned: number, bonus: number, adv: number, ded: number): number =>
  Math.round((base * days) / planned + bonus - adv - ded);

export const payrollLines: PayrollLine[] = (() => {
  const seed: Omit<PayrollLine, "net">[] = [
    { id: "pl1",  employeeId: "e1", name: "Mohamed Benali",   role: "Chef de chantier", projectId: "p1", baseSalary: 95_000,  daysWorked: 26, daysPlanned: 26, bonuses: 12_000, advances:      0, deductions:     0, status: "validated" },
    { id: "pl2",  employeeId: "e2", name: "Karim Boudjedra",  role: "Caissier",         projectId: "p1", baseSalary: 78_000,  daysWorked: 25, daysPlanned: 26, bonuses:  6_000, advances: 12_000, deductions:     0, status: "validated" },
    { id: "pl3",  employeeId: "e3", name: "Yacine Hamidi",    role: "Conducteur",       projectId: "p4", baseSalary: 62_000,  daysWorked: 24, daysPlanned: 26, bonuses:  4_500, advances:  8_000, deductions:     0, status: "draft"     },
    { id: "pl4",  employeeId: "e4", name: "Saïd Mansouri",    role: "Mécanicien",       projectId: "p2", baseSalary: 70_000,  daysWorked: 26, daysPlanned: 26, bonuses:  8_000, advances:      0, deductions: 1_500, status: "paid"      },
    { id: "pl5",  employeeId: "e5", name: "Rachid Khelifi",   role: "Topographe",       projectId: "p6", baseSalary: 88_000,  daysWorked: 22, daysPlanned: 26, bonuses:  5_000, advances:      0, deductions:     0, status: "validated" },
    { id: "pl6",  employeeId: "e6", name: "Nadir Saadi",      role: "Magasinier",       projectId: "p5", baseSalary: 58_000,  daysWorked: 26, daysPlanned: 26, bonuses:  3_000, advances:  5_000, deductions:     0, status: "validated" },
    { id: "pl7",  employeeId: "e7", name: "Hamid Belkacem",   role: "Conducteur engin", projectId: "p3", baseSalary: 74_000,  daysWorked: 23, daysPlanned: 26, bonuses:  4_000, advances:      0, deductions:     0, status: "draft"     },
    { id: "pl8",  employeeId: "e8", name: "Tarek Zerouki",    role: "Maçon",            projectId: "p7", baseSalary: 52_000,  daysWorked: 25, daysPlanned: 26, bonuses:  2_500, advances:      0, deductions:     0, status: "paid"      },
    { id: "pl9",  employeeId: "e9", name: "Lounès Hadj",      role: "Manœuvre",         projectId: "p1", baseSalary: 38_000,  daysWorked: 26, daysPlanned: 26, bonuses:  1_500, advances:      0, deductions:     0, status: "validated" },
    { id: "pl10", employeeId: "e10",name: "Brahim Khellaf",   role: "Chauffeur",        projectId: "p5", baseSalary: 56_000,  daysWorked: 24, daysPlanned: 26, bonuses:  3_500, advances:  4_000, deductions:     0, status: "draft"     },
    { id: "pl11", employeeId: "e11",name: "Omar Ferhat",      role: "Maçon",            projectId: "p3", baseSalary: 50_000,  daysWorked: 26, daysPlanned: 26, bonuses:  2_000, advances:      0, deductions:     0, status: "validated" },
    { id: "pl12", employeeId: "e12",name: "Djamel Aliouane",  role: "Soudeur",          projectId: "p2", baseSalary: 64_000,  daysWorked: 25, daysPlanned: 26, bonuses:  4_000, advances:      0, deductions: 1_000, status: "validated" },
  ];
  return seed.map((l) => ({ ...l, net: _payBase(l.baseSalary, l.daysWorked, l.daysPlanned, l.bonuses, l.advances, l.deductions) }));
})();

/** Monthly payroll cost — 6 months (DA) */
export const monthlyPayroll = [
  { month: "M-5", base: 720_000,  bonuses: 48_000,  advances: 32_000 },
  { month: "M-4", base: 745_000,  bonuses: 52_000,  advances: 28_000 },
  { month: "M-3", base: 760_000,  bonuses: 61_000,  advances: 35_000 },
  { month: "M-2", base: 758_000,  bonuses: 55_000,  advances: 41_000 },
  { month: "M-1", base: 782_000,  bonuses: 64_000,  advances: 38_000 },
  { month: "M",   base: 785_000,  bonuses: 56_000,  advances: 29_000 },
];

/* ---------- Attendance ---------- */

export type AttendanceStatus = "present" | "absent" | "leave" | "rest";

export interface AttendanceCell {
  date: string;          // YYYY-MM-DD
  present: number;
  absent: number;
  leave: number;
}

/** 12 weeks x 7 days calendar heatmap — total team attendance */
export const attendanceHeatmap: AttendanceCell[] = (() => {
  const out: AttendanceCell[] = [];
  const total = 48; // total team
  for (let i = 83; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const dow = dt.getDay(); // 0 sun, 5 fri, 6 sat
    const isWeekend = dow === 5 || dow === 6;
    const wave = Math.sin(i / 5) * 0.06;
    const presentRatio = isWeekend ? 0 : Math.max(0, 0.84 + wave - (i % 11 === 0 ? 0.18 : 0));
    const present = Math.round(total * presentRatio);
    const leave   = isWeekend ? 0 : Math.round(total * (0.04 + (i % 9 === 0 ? 0.06 : 0)));
    const absent  = isWeekend ? 0 : Math.max(0, total - present - leave);
    out.push({
      date: dt.toISOString().slice(0, 10),
      present, absent, leave,
    });
  }
  return out;
})();

export interface DailyAttendanceRow {
  employeeId: string;
  name: string;
  role: string;
  projectId: string;
  status: AttendanceStatus;
  hours: number;
  checkIn?: string;
  checkOut?: string;
}

export const todayAttendance: DailyAttendanceRow[] = [
  { employeeId: "e1",  name: "Mohamed Benali",  role: "Chef chantier",   projectId: "p1", status: "present", hours: 9, checkIn: "07:12", checkOut: "16:48" },
  { employeeId: "e2",  name: "Karim Boudjedra", role: "Caissier",        projectId: "p1", status: "present", hours: 8, checkIn: "08:02", checkOut: "16:30" },
  { employeeId: "e3",  name: "Yacine Hamidi",   role: "Conducteur",      projectId: "p4", status: "present", hours: 9, checkIn: "06:55", checkOut: "16:40" },
  { employeeId: "e4",  name: "Saïd Mansouri",   role: "Mécanicien",      projectId: "p2", status: "leave",   hours: 0 },
  { employeeId: "e5",  name: "Rachid Khelifi",  role: "Topographe",      projectId: "p6", status: "present", hours: 8, checkIn: "07:30", checkOut: "16:15" },
  { employeeId: "e6",  name: "Nadir Saadi",     role: "Magasinier",      projectId: "p5", status: "present", hours: 9, checkIn: "07:05", checkOut: "16:55" },
  { employeeId: "e7",  name: "Hamid Belkacem",  role: "Conducteur",      projectId: "p3", status: "absent",  hours: 0 },
  { employeeId: "e8",  name: "Tarek Zerouki",   role: "Maçon",           projectId: "p7", status: "present", hours: 9, checkIn: "07:18", checkOut: "16:50" },
  { employeeId: "e9",  name: "Lounès Hadj",     role: "Manœuvre",        projectId: "p1", status: "present", hours: 9, checkIn: "07:20", checkOut: "16:42" },
  { employeeId: "e10", name: "Brahim Khellaf",  role: "Chauffeur",       projectId: "p5", status: "present", hours: 8, checkIn: "07:45", checkOut: "16:20" },
  { employeeId: "e11", name: "Omar Ferhat",     role: "Maçon",           projectId: "p3", status: "absent",  hours: 0 },
  { employeeId: "e12", name: "Djamel Aliouane", role: "Soudeur",         projectId: "p2", status: "present", hours: 9, checkIn: "07:00", checkOut: "16:35" },
];
/* ---------- Machines & Vehicles ---------- */

export type MachineKind = "truck" | "excavator" | "loader" | "roller" | "grader" | "paver" | "pickup";
export type MachineStatus = "active" | "idle" | "repair";

export interface Machine {
  id: string;
  code: string;
  name: string;
  kind: MachineKind;
  projectId: string;
  status: MachineStatus;
  hoursMonth: number;
  fuelMonth: number;     // liters
  fuelCostMonth: number; // DA
  repairCostMonth: number;
  utilization: number;   // 0-100
  odometer: number;      // km or hours total
  lastService: string;   // ISO
}

export const machines: Machine[] = [
  { id: "m1",  code: "CAM-21", name: "Camion benne 8x4 — Mercedes 4140", kind: "truck",     projectId: "p1", status: "active", hoursMonth: 188, fuelMonth: 2840, fuelCostMonth: 1_134_000, repairCostMonth: 142_000, utilization: 88, odometer: 184_300, lastService: d(12) },
  { id: "m2",  code: "PEL-07", name: "Pelle hydraulique — Cat 320D",     kind: "excavator", projectId: "p3", status: "active", hoursMonth: 162, fuelMonth: 2210, fuelCostMonth:   882_000, repairCostMonth:  68_000, utilization: 76, odometer:  9_840, lastService: d(20) },
  { id: "m3",  code: "FIN-02", name: "Finisseur — Vögele Super 1800",     kind: "paver",     projectId: "p5", status: "repair", hoursMonth:  44, fuelMonth:  610, fuelCostMonth:   244_000, repairCostMonth: 712_000, utilization: 21, odometer:  6_120, lastService: d(2)  },
  { id: "m4",  code: "COM-14", name: "Compacteur — Bomag BW 174",         kind: "roller",    projectId: "p1", status: "active", hoursMonth: 152, fuelMonth:  980, fuelCostMonth:   392_000, repairCostMonth:  31_000, utilization: 71, odometer:  4_870, lastService: d(28) },
  { id: "m5",  code: "CHA-09", name: "Chargeuse — Volvo L120",            kind: "loader",    projectId: "p2", status: "active", hoursMonth: 144, fuelMonth: 1620, fuelCostMonth:   648_000, repairCostMonth:  88_000, utilization: 67, odometer: 11_240, lastService: d(34) },
  { id: "m6",  code: "NIV-03", name: "Niveleuse — Cat 140K",              kind: "grader",    projectId: "p7", status: "active", hoursMonth: 128, fuelMonth: 1380, fuelCostMonth:   552_000, repairCostMonth:  46_000, utilization: 60, odometer:  7_960, lastService: d(40) },
  { id: "m7",  code: "CAM-22", name: "Camion benne 6x4 — Sonacom",        kind: "truck",     projectId: "p4", status: "idle",   hoursMonth:  62, fuelMonth:  720, fuelCostMonth:   288_000, repairCostMonth: 388_000, utilization: 29, odometer: 212_400, lastService: d(7)  },
  { id: "m8",  code: "PEL-08", name: "Pelle — Komatsu PC210",             kind: "excavator", projectId: "p7", status: "active", hoursMonth: 174, fuelMonth: 2380, fuelCostMonth:   952_000, repairCostMonth:  54_000, utilization: 81, odometer:  8_120, lastService: d(18) },
  { id: "m9",  code: "COM-15", name: "Compacteur — Hamm 3411",            kind: "roller",    projectId: "p2", status: "active", hoursMonth: 138, fuelMonth:  860, fuelCostMonth:   344_000, repairCostMonth:  28_000, utilization: 64, odometer:  3_640, lastService: d(22) },
  { id: "m10", code: "PIC-04", name: "Pickup — Toyota Hilux",             kind: "pickup",    projectId: "p6", status: "active", hoursMonth: 156, fuelMonth:  610, fuelCostMonth:   244_000, repairCostMonth:  18_000, utilization: 58, odometer:  64_200, lastService: d(45) },
  { id: "m11", code: "CAM-23", name: "Camion citerne eau — Renault",      kind: "truck",     projectId: "p5", status: "active", hoursMonth: 132, fuelMonth: 1280, fuelCostMonth:   512_000, repairCostMonth:  62_000, utilization: 62, odometer: 138_900, lastService: d(30) },
  { id: "m12", code: "FIN-03", name: "Finisseur — Dynapac F1700",         kind: "paver",     projectId: "p1", status: "active", hoursMonth: 118, fuelMonth: 1420, fuelCostMonth:   568_000, repairCostMonth:  74_000, utilization: 55, odometer:  5_240, lastService: d(38) },
];

/** 30-day fuel consumption (liters) — top 4 machines */
export const fuelTrend = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const date = d(day).slice(5, 10);
  const base = 90 + Math.sin(i / 4) * 18;
  return {
    date,
    "CAM-21": Math.round(base + Math.cos(i / 3) * 12 + (i % 7 === 0 ? 14 : 0)),
    "PEL-07": Math.round(base * 0.78 + Math.sin(i / 2) * 9),
    "PEL-08": Math.round(base * 0.84 + Math.cos(i / 2) * 10),
    "CHA-09": Math.round(base * 0.62 + Math.sin(i / 5) * 8),
  };
});

/* ---------- Supplier extended metadata ---------- */

export type SupplierStatus = "ok" | "balance" | "overdue";

export interface SupplierMeta {
  id: string;
  totalSpend: number;       // DA last 90 days
  outstanding: number;      // DA unpaid
  invoicesCount: number;
  lastInvoice: string;      // ISO
  paymentTerms: number;     // days
  status: SupplierStatus;
  city: string;
  contact: string;
}

export const supplierMeta: Record<string, SupplierMeta> = {
  s1: { id: "s1", totalSpend: 18_400_000, outstanding:  3_800_000, invoicesCount: 24, lastInvoice: d(0),  paymentTerms: 30, status: "balance", city: "Alger",      contact: "+213 23 45 67 89" },
  s2: { id: "s2", totalSpend: 14_200_000, outstanding:          0, invoicesCount: 12, lastInvoice: d(2),  paymentTerms: 45, status: "ok",      city: "Skikda",     contact: "+213 38 22 11 04" },
  s3: { id: "s3", totalSpend:  9_800_000, outstanding:  1_200_000, invoicesCount:  8, lastInvoice: d(8),  paymentTerms: 30, status: "balance", city: "Chlef",      contact: "+213 27 31 90 12" },
  s4: { id: "s4", totalSpend:  6_400_000, outstanding:    420_000, invoicesCount: 14, lastInvoice: d(2),  paymentTerms: 15, status: "ok",      city: "Médéa",      contact: "+213 25 58 11 76" },
  s5: { id: "s5", totalSpend:  4_900_000, outstanding:  2_180_000, invoicesCount:  9, lastInvoice: d(1),  paymentTerms: 30, status: "overdue", city: "Bouira",     contact: "+213 26 73 22 18" },
  s6: { id: "s6", totalSpend:  3_640_000, outstanding:    280_000, invoicesCount: 11, lastInvoice: d(2),  paymentTerms: 15, status: "ok",      city: "Boumerdès",  contact: "+213 24 79 30 41" },
  s7: { id: "s7", totalSpend: 12_800_000, outstanding:  4_600_000, invoicesCount:  6, lastInvoice: d(1),  paymentTerms: 60, status: "overdue", city: "Alger",      contact: "+213 23 91 02 14" },
  s8: { id: "s8", totalSpend:    920_000, outstanding:          0, invoicesCount: 18, lastInvoice: d(7),  paymentTerms: 15, status: "ok",      city: "El Affroun", contact: "+213 25 38 47 22" },
};

/* ---------- Employee extended roster ---------- */

export type EmployeeStatus = "active" | "leave" | "inactive";

export interface EmployeeMeta {
  id: string;
  name: string;
  role: string;
  projectId: string;
  hireDate: string;
  phone: string;
  status: EmployeeStatus;
  baseSalary: number;
  cashHeld: number;        // DA outstanding (cash holder)
  daysWorkedMonth: number;
}

export const employeeRoster: EmployeeMeta[] = [
  { id: "e1",  name: "Mohamed Benali",   role: "Chef de chantier",  projectId: "p1", hireDate: "2018-04-12", phone: "+213 661 22 14 09", status: "active", baseSalary: 95_000, cashHeld: 1_240_000, daysWorkedMonth: 26 },
  { id: "e2",  name: "Karim Boudjedra",  role: "Caissier",          projectId: "p1", hireDate: "2020-09-03", phone: "+213 770 41 88 12", status: "active", baseSalary: 78_000, cashHeld: 4_820_000, daysWorkedMonth: 25 },
  { id: "e3",  name: "Yacine Hamidi",    role: "Conducteur engin",  projectId: "p4", hireDate: "2019-01-22", phone: "+213 551 30 27 88", status: "active", baseSalary: 62_000, cashHeld:   680_000, daysWorkedMonth: 24 },
  { id: "e4",  name: "Saïd Mansouri",    role: "Mécanicien",        projectId: "p2", hireDate: "2017-06-18", phone: "+213 550 12 73 41", status: "leave",  baseSalary: 70_000, cashHeld:         0, daysWorkedMonth: 18 },
  { id: "e5",  name: "Rachid Khelifi",   role: "Topographe",        projectId: "p6", hireDate: "2021-03-08", phone: "+213 661 88 14 02", status: "active", baseSalary: 88_000, cashHeld:   320_000, daysWorkedMonth: 22 },
  { id: "e6",  name: "Nadir Saadi",      role: "Magasinier",        projectId: "p5", hireDate: "2019-11-14", phone: "+213 770 22 91 30", status: "active", baseSalary: 58_000, cashHeld:   910_000, daysWorkedMonth: 26 },
  { id: "e7",  name: "Hamid Belkacem",   role: "Conducteur engin",  projectId: "p3", hireDate: "2020-02-05", phone: "+213 555 41 02 18", status: "active", baseSalary: 74_000, cashHeld:         0, daysWorkedMonth: 23 },
  { id: "e8",  name: "Tarek Zerouki",    role: "Maçon",             projectId: "p7", hireDate: "2022-05-19", phone: "+213 661 73 28 04", status: "active", baseSalary: 52_000, cashHeld:         0, daysWorkedMonth: 25 },
  { id: "e9",  name: "Lounès Hadj",      role: "Manœuvre",          projectId: "p1", hireDate: "2023-01-11", phone: "+213 552 17 90 33", status: "active", baseSalary: 38_000, cashHeld:         0, daysWorkedMonth: 26 },
  { id: "e10", name: "Brahim Khellaf",   role: "Chauffeur",         projectId: "p5", hireDate: "2018-08-30", phone: "+213 770 04 18 27", status: "active", baseSalary: 56_000, cashHeld:         0, daysWorkedMonth: 24 },
  { id: "e11", name: "Omar Ferhat",      role: "Maçon",             projectId: "p3", hireDate: "2022-10-04", phone: "+213 661 28 90 14", status: "active", baseSalary: 50_000, cashHeld:         0, daysWorkedMonth: 26 },
  { id: "e12", name: "Djamel Aliouane",  role: "Soudeur",           projectId: "p2", hireDate: "2019-07-22", phone: "+213 550 38 14 09", status: "active", baseSalary: 64_000, cashHeld:         0, daysWorkedMonth: 25 },
  { id: "e13", name: "Mourad Belhadj",   role: "Manœuvre",          projectId: "p7", hireDate: "2023-06-01", phone: "+213 552 91 04 18", status: "active", baseSalary: 36_000, cashHeld:         0, daysWorkedMonth: 24 },
  { id: "e14", name: "Slimane Cherif",   role: "Conducteur engin",  projectId: "p5", hireDate: "2020-04-18", phone: "+213 661 14 73 28", status: "inactive", baseSalary: 70_000, cashHeld:       0, daysWorkedMonth: 0  },
];
