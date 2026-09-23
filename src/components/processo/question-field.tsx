"use client";

import { SpeakButton } from "@/components/accessibility/speak-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Pergunta } from "@/types";

type QuestionFieldProps = {
  pergunta: Pergunta;
  numero: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/**
 * Exibe uma pergunta como o candidato vê (FE18).
 * Também é usada na pré-visualização do processo seletivo (FE11).
 */
export function QuestionField({ pergunta, numero, value, onChange, disabled }: QuestionFieldProps) {
  const id = `pergunta-${pergunta.id}`;
  const textoParaOuvir =
    pergunta.tipo === "multipla_escolha"
      ? `Pergunta ${numero}. ${pergunta.enunciado}. Opções: ${pergunta.opcoes.join("; ")}.`
      : `Pergunta ${numero}. ${pergunta.enunciado}`;

  if (pergunta.tipo === "multipla_escolha") {
    return (
      <div role="radiogroup" aria-labelledby={`${id}-titulo`} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p id={`${id}-titulo`} className="text-lg font-medium">
            <span className="text-muted-foreground">{numero}. </span>
            {pergunta.enunciado}
          </p>
          <SpeakButton text={textoParaOuvir} className="shrink-0" />
        </div>
        <div className="space-y-2">
          {pergunta.opcoes.map((opcao, index) => {
            const optionId = `${id}-opcao-${index}`;
            const checked = value === opcao;
            return (
              <label
                key={optionId}
                htmlFor={optionId}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                  checked ? "border-primary bg-secondary" : "hover:bg-accent",
                  disabled && "cursor-not-allowed opacity-70"
                )}
              >
                <input
                  type="radio"
                  id={optionId}
                  name={id}
                  value={opcao}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(opcao)}
                  className="size-5 accent-primary"
                />
                <span>{opcao}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <label htmlFor={id} className="text-lg font-medium">
          <span className="text-muted-foreground">{numero}. </span>
          {pergunta.enunciado}
        </label>
        <SpeakButton text={textoParaOuvir} className="shrink-0" />
      </div>
      <Textarea
        id={id}
        rows={5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escreva sua resposta aqui"
      />
    </div>
  );
}
