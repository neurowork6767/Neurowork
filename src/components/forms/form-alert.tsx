import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type FormAlertProps = {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
};

const STYLES = {
  error: { icon: AlertCircle, className: "border-destructive/30 bg-destructive/5 text-destructive" },
  success: { icon: CheckCircle2, className: "border-success/30 bg-success/5 text-success" },
  info: { icon: Info, className: "border-navy/20 bg-navy/5 text-navy" },
};

/** Mensagem dentro do formulário (erro geral, sucesso ou informação). */
export function FormAlert({ variant = "error", children, className }: FormAlertProps) {
  const { icon: Icon, className: variantClass } = STYLES[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4 text-sm", variantClass, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="text-foreground">{children}</div>
    </div>
  );
}
