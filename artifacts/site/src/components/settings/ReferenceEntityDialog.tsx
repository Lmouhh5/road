import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInsertProject } from "@/hooks/queries/useProjectsList";
import { useInsertEmployee } from "@/hooks/queries/useEmployees";
import { useInsertMachine } from "@/hooks/queries/useMachines";
import { useInsertSupplier } from "@/hooks/queries/useSuppliers";
import { useInsertCashHolder } from "@/hooks/queries/useCash";

export type RefEntityKind =
  | "projects"
  | "employees"
  | "machines"
  | "suppliers"
  | "cash_holders";

interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
  placeholder?: string;
}

const FIELDS: Record<RefEntityKind, FieldDef[]> = {
  projects: [
    { name: "code", label: "Code", required: true, placeholder: "P-001" },
    { name: "name", label: "Nom", required: true },
    { name: "budget", label: "Budget (DA)", type: "number" },
  ],
  employees: [
    { name: "name", label: "Nom", required: true },
    { name: "role", label: "Poste", placeholder: "Chauffeur, Chef de chantier…" },
    { name: "phone", label: "Téléphone" },
    { name: "base_salary", label: "Salaire de base (DA)", type: "number" },
  ],
  machines: [
    { name: "name", label: "Nom", required: true },
    { name: "code", label: "Code", placeholder: "M-001" },
    { name: "type", label: "Type", placeholder: "truck, excavator, loader…" },
  ],
  suppliers: [
    { name: "name", label: "Nom", required: true },
    { name: "category", label: "Catégorie", placeholder: "fuel, materials…" },
    { name: "contact", label: "Contact" },
    { name: "phone", label: "Téléphone" },
  ],
  cash_holders: [
    { name: "name", label: "Nom", required: true },
    { name: "role", label: "Rôle", placeholder: "Owner, Accountant, PM…" },
    { name: "balance", label: "Solde initial (DA)", type: "number" },
  ],
};

const TITLES: Record<RefEntityKind, string> = {
  projects: "Nouveau chantier",
  employees: "Nouvel employé",
  machines: "Nouvelle machine / véhicule",
  suppliers: "Nouveau fournisseur",
  cash_holders: "Nouveau détenteur de caisse",
};

function useInsertFor(kind: RefEntityKind) {
  const p = useInsertProject();
  const e = useInsertEmployee();
  const m = useInsertMachine();
  const s = useInsertSupplier();
  const c = useInsertCashHolder();
  switch (kind) {
    case "projects": return p;
    case "employees": return e;
    case "machines": return m;
    case "suppliers": return s;
    case "cash_holders": return c;
  }
}

interface Props {
  kind: RefEntityKind;
  trigger?: React.ReactNode;
}

export function ReferenceEntityDialog({ kind, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const fields = FIELDS[kind];
  const mutation = useInsertFor(kind);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = String(fd.get(f.name) ?? "").trim();
      if (!raw) continue;
      payload[f.name] = f.type === "number" ? Number(raw) : raw;
    }
    if (!payload.name && !payload.code) {
      toast.error("Champs requis manquants");
      return;
    }
    mutation.mutate(payload as never, {
      onSuccess: () => {
        toast.success("Enregistré");
        setOpen(false);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Erreur";
        toast.error(msg);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{TITLES[kind]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {fields.map((f) => (
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
                maxLength={200}
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
