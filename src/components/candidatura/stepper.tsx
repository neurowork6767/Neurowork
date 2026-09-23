import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type StepperProps = {
  steps: string[];
  current: number;
};

/** Indicador de etapas: mostra onde o candidato está e quanto falta. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <nav aria-label="Etapas da candidatura">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Etapa {current + 1} de {steps.length}
      </p>
      <ol className="flex gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className="flex-1" aria-current={active ? "step" : undefined}>
              <div className={cn("h-1.5 rounded-full", done || active ? "bg-primary" : "bg-muted")} />
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs sm:text-sm",
                  active ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {done && <Check className="size-3.5 text-success" aria-hidden="true" />}
                {step}
                {done && <span className="sr-only"> (concluída)</span>}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
