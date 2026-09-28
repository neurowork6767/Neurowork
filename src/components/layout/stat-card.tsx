import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  /** Cor do ícone, alternando o azul e o verde da marca */
  tone?: "blue" | "green";
};

export function StatCard({ label, value, icon: Icon, hint, tone = "blue" }: StatCardProps) {
  return (
    <Card className="relative flex items-start justify-between gap-3 overflow-hidden p-5">
      <span
        className={cn("absolute inset-x-0 top-0 h-1", tone === "blue" ? "bg-brand-blue" : "bg-brand-green")}
        data-decorative
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-3xl font-bold text-navy">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span
        className={cn("rounded-lg p-2.5", tone === "blue" ? "bg-secondary text-primary" : "bg-success/10 text-success")}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
    </Card>
  );
}
