"use client";

import * as React from "react";
import { Accessibility, Contrast, RotateCcw, Sparkles, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccessibility, type FontScale } from "./accessibility-provider";

const FONT_OPTIONS: { value: FontScale; label: string; description: string }[] = [
  { value: "md", label: "A", description: "Tamanho normal" },
  { value: "lg", label: "A+", description: "Tamanho grande" },
  { value: "xl", label: "A++", description: "Tamanho muito grande" },
];

type ToggleRowProps = {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleRow({ id, icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-3">
        <span className="mt-0.5 text-primary" aria-hidden="true">
          {icon}
        </span>
        <div>
          <label htmlFor={id} className="font-medium">
            {label}
          </label>
          <p id={`${id}-desc`} className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

/** Painel de acessibilidade (FE02), disponível no cabeçalho de todas as telas. */
export function AccessibilityMenu({ className }: { className?: string }) {
  const { highContrast, fontScale, simplified, update, reset } = useAccessibility();
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls="painel-acessibilidade"
        onClick={() => setOpen((v) => !v)}
      >
        <Accessibility aria-hidden="true" />
        <span className="hidden sm:inline">Acessibilidade</span>
        <span className="sr-only sm:hidden">Acessibilidade</span>
      </Button>

      {open && (
        <div
          ref={panelRef}
          id="painel-acessibilidade"
          role="region"
          aria-label="Opções de acessibilidade"
          className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-5 rounded-xl border bg-popover p-5 text-popover-foreground shadow-lg"
        >
          <p className="font-semibold">Ajuste a tela do seu jeito</p>

          <ToggleRow
            id="alto-contraste"
            icon={<Contrast className="size-5" />}
            label="Alto contraste"
            description="Cores mais fortes para facilitar a leitura."
            checked={highContrast}
            onChange={(checked) => update({ highContrast: checked })}
          />

          <ToggleRow
            id="modo-simplificado"
            icon={<Sparkles className="size-5" />}
            label="Modo simplificado"
            description="Remove enfeites e animações para reduzir estímulos."
            checked={simplified}
            onChange={(checked) => update({ simplified: checked })}
          />

          <fieldset>
            <legend className="mb-2 flex items-center gap-3 font-medium">
              <Type className="size-5 text-primary" aria-hidden="true" />
              Tamanho do texto
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {FONT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={fontScale === option.value ? "default" : "outline"}
                  aria-pressed={fontScale === option.value}
                  aria-label={option.description}
                  onClick={() => update({ fontScale: option.value })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>

          <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Voltar ao padrão
          </Button>
        </div>
      )}
    </div>
  );
}
