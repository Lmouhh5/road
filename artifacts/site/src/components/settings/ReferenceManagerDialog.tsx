import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectsList, useInsertProject } from "@/hooks/queries/useProjectsList";
import { useEmployees, useInsertEmployee } from "@/hooks/queries/useEmployees";
import { useMachines, useInsertMachine } from "@/hooks/queries/useMachines";
import { useSuppliers, useInsertSupplier } from "@/hooks/queries/useSuppliers";
import { useCashHolders, useInsertCashHolder } from "@/hooks/queries/useCash";
import {
  useExpenseCategories, useInsertExpenseCategory,
  useSubCostCenters, useInsertSubCostCenter,
} from "@/hooks/queries/useTaxonomies";
import { useUpdateRef, useDeleteRef } from "@/hooks/queries/useRefMutations";

export type RefEntityKind =
  | "projects" | "employees" | "machines" | "suppliers" | "cash_holders"
  | "categories" | "subcost";

interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
  placeholder?: string;
  showInTable?: boolean;
}

interface EntityConfig {
  table: "projects" | "employees" | "assets" | "suppliers" | "cash_holders" | "expense_categories" | "sub_cost_centers";
  title: string;
  fields: FieldDef[];
}

const CONFIG: Record<RefEntityKind, EntityConfig> = {
  projects: {
    table: "projects",
    title: "Chantiers",
    fields: [
      { name: "code", label: "Code", required: true, showInTable: true },
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "budget", label: "Budget (DA)", type: "number", showInTable: true },
    ],
  },
  employees: {
    table: "employees",
    title: "Employés",
    fields: [
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "role", label: "Poste", showInTable: true },
      { name: "phone", label: "Téléphone", showInTable: true },
      { name: "base_salary", label: "Salaire (DA)", type: "number", showInTable: true },
    ],
  },
  machines: {
    table: "assets",
    title: "Machines & Véhicules",
    fields: [
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "code", label: "Code", showInTable: true },
      { name: "type", label: "Type", placeholder: "truck, excavator…", showInTable: true },
    ],
  },
  suppliers: {
    table: "suppliers",
    title: "Fournisseurs",
    fields: [
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "category", label: "Catégorie", showInTable: true },
      { name: "contact", label: "Contact", showInTable: true },
      { name: "phone", label: "Téléphone", showInTable: true },
    ],
  },
  cash_holders: {
    table: "cash_holders",
    title: "Détenteurs de caisse",
    fields: [
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "role", label: "Rôle", showInTable: true },
      { name: "balance", label: "Solde (DA)", type: "number", showInTable: true },
    ],
  },
  categories: {
    table: "expense_categories",
    title: "Catégories de dépenses",
    fields: [
      { name: "code", label: "Code", required: true, placeholder: "fuel", showInTable: true },
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "sort_order", label: "Ordre", type: "number", showInTable: true },
    ],
  },
  subcost: {
    table: "sub_cost_centers",
    title: "Sous-centres de coût",
    fields: [
      { name: "code", label: "Code", required: true, placeholder: "EARTH", showInTable: true },
      { name: "name", label: "Nom", required: true, showInTable: true },
      { name: "sort_order", label: "Ordre", type: "number", showInTable: true },
    ],
  },
};

function useListFor(kind: RefEntityKind) {
  const p = useProjectsList();
  const e = useEmployees();
  const m = useMachines();
  const s = useSuppliers();
  const c = useCashHolders();
  const cat = useExpenseCategories();
  const scc = useSubCostCenters();
  switch (kind) {
    case "projects":
      return { isLoading: p.isLoading, rows: (p.data ?? []).map((r) => ({ id: r.id, code: r.code, name: r.name, budget: "" })) };
    case "employees":
      return { isLoading: e.isLoading, rows: (e.data ?? []).map((r) => ({ id: r.id, name: r.name, role: r.role, phone: r.phone, base_salary: r.baseSalary })) };
    case "machines":
      return { isLoading: m.isLoading, rows: (m.data ?? []).map((r) => ({ id: r.id, name: r.name, code: r.code, type: r.kind })) };
    case "suppliers":
      return { isLoading: s.isLoading, rows: (s.data ?? []).map((r) => ({ id: r.id, name: r.name, category: r.category, contact: r.contact, phone: r.phone })) };
    case "cash_holders":
      return { isLoading: c.isLoading, rows: (c.data ?? []).map((r) => ({ id: r.id, name: r.name, role: r.role, balance: r.balance })) };
    case "categories":
      return { isLoading: cat.isLoading, rows: (cat.data ?? []).map((r) => ({ id: r.id, code: r.code, name: r.name, sort_order: r.sort_order })) };
    case "subcost":
      return { isLoading: scc.isLoading, rows: (scc.data ?? []).map((r) => ({ id: r.id, code: r.code, name: r.name, sort_order: r.sort_order })) };
  }
}

function useInsertFor(kind: RefEntityKind) {
  const p = useInsertProject();
  const e = useInsertEmployee();
  const m = useInsertMachine();
  const s = useInsertSupplier();
  const c = useInsertCashHolder();
  const cat = useInsertExpenseCategory();
  const scc = useInsertSubCostCenter();
  switch (kind) {
    case "projects": return p;
    case "employees": return e;
    case "machines": return m;
    case "suppliers": return s;
    case "cash_holders": return c;
    case "categories": return cat;
    case "subcost": return scc;
  }
}

interface Props {
  kind: RefEntityKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferenceManagerDialog({ kind, open, onOpenChange }: Props) {
  const cfg = CONFIG[kind];
  const list = useListFor(kind);
  const insertM = useInsertFor(kind);
  const updateM = useUpdateRef(cfg.table);
  const deleteM = useDeleteRef(cfg.table);

  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setShowForm(false);
      setConfirmDelete(null);
    }
  }, [open]);

  const tableFields = useMemo(() => cfg.fields.filter((f) => f.showInTable), [cfg.fields]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const f of cfg.fields) {
      const raw = String(fd.get(f.name) ?? "").trim();
      if (!raw) continue;
      payload[f.name] = f.type === "number" ? Number(raw) : raw;
    }

    const onSuccess = () => {
      toast.success(editing ? "Mis à jour" : "Ajouté");
      setShowForm(false);
      setEditing(null);
    };
    const onError = (err: unknown) => toast.error(err instanceof Error ? err.message : "Erreur");

    if (editing?.id) {
      updateM.mutate({ id: String(editing.id), values: payload }, { onSuccess, onError });
    } else {
      insertM.mutate(payload as never, { onSuccess, onError });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>{cfg.title}</span>
              {!showForm && (
                <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setShowForm(true); }}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {showForm ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cfg.fields.map((f) => (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={f.name}>
                      {f.label}{f.required && <span className="text-destructive"> *</span>}
                    </Label>
                    <Input
                      id={f.name}
                      name={f.name}
                      type={f.type === "number" ? "number" : "text"}
                      step={f.type === "number" ? "any" : undefined}
                      required={f.required}
                      placeholder={f.placeholder}
                      defaultValue={editing ? String(editing[f.name] ?? "") : ""}
                      maxLength={200}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>
                  <X className="h-4 w-4 mr-1" /> Annuler
                </Button>
                <Button type="submit" disabled={insertM.isPending || updateM.isPending}>
                  {editing ? "Mettre à jour" : "Enregistrer"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableFields.map((f) => <TableHead key={f.name}>{f.label}</TableHead>)}
                    <TableHead className="w-24 text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.isLoading ? (
                    <TableRow><TableCell colSpan={tableFields.length + 1} className="text-center text-muted-foreground py-6">Chargement…</TableCell></TableRow>
                  ) : list.rows.length === 0 ? (
                    <TableRow><TableCell colSpan={tableFields.length + 1} className="text-center text-muted-foreground py-6">Aucune donnée</TableCell></TableRow>
                  ) : (
                    list.rows.map((row) => (
                      <TableRow key={row.id}>
                        {tableFields.map((f) => (
                          <TableCell key={f.name} className={f.type === "number" ? "font-mono-num" : ""}>
                            {String((row as Record<string, unknown>)[f.name] ?? "—")}
                          </TableCell>
                        ))}
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8"
                              onClick={() => { setEditing(row as Record<string, unknown>); setShowForm(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete(String(row.id))}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmDelete) return;
                deleteM.mutate(confirmDelete, {
                  onSuccess: () => { toast.success("Supprimé"); setConfirmDelete(null); },
                  onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
                });
              }}
            >Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
