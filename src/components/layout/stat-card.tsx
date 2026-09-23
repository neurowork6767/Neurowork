import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
};

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold text-navy">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className="rounded-lg bg-secondary p-2.5" data-decorative aria-hidden="true">
        <Icon className="size-5 text-secondary-foreground" />
      </span>
    </Card>
  );
}
