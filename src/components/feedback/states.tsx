import * as React from "react";
import { AlertTriangle, CheckCircle2, Inbox, Loader2, RotateCcw, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Estados visuais padronizados (FE03): carregando, vazio, erro e sucesso.
 * Todos têm texto, e não apenas ícone, para não depender só da visão.
 */

type LoadingStateProps = {
  label?: string;
  variant?: "spinner" | "list" | "cards";
  className?: string;
};

export function LoadingState({ label = "Carregando…", variant = "spinner", className }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className={cn("w-full", className)}>
      <span className="sr-only">{label}</span>
      {variant === "spinner" && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <p aria-hidden="true">{label}</p>
        </div>
      )}
      {variant === "list" && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center",
        className
      )}
    >
      <div className="rounded-full bg-secondary p-3" data-decorative>
        <Icon className="size-6 text-secondary-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-md text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Não foi possível carregar",
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className
      )}
    >
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            Tentar novamente
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}

type SuccessStateProps = {
  title: string;
  /** Use "h1" quando o estado de sucesso for o conteúdo principal da página */
  titleAs?: "h1" | "h2";
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function SuccessState({ title, titleAs: Title = "h2", description, action, className }: SuccessStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-success/30 bg-success/5 px-6 py-12 text-center",
        className
      )}
    >
      <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
      <Title className="text-xl font-semibold">{title}</Title>
      {description && <div className="max-w-md text-muted-foreground">{description}</div>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
