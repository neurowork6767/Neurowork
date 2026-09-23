"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Pergunta } from "@/types";

type PerguntaEditorProps = {
  pergunta: Pergunta;
  index: number;
  total: number;
  /** Caminho usado para achar os erros, ex.: "etapas[0].perguntas[1]" */
  path: string;
  errors: Record<string, string>;
  onChange: (pergunta: Pergunta) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function PerguntaEditor({
  pergunta,
  index,
  total,
  path,
  errors,
  onChange,
  onRemove,
  onMove,
}: PerguntaEditorProps) {
  const baseId = `p-${pergunta.id}`;
  const enunciadoError = errors[`${path}.enunciado`];
  const opcoesError = errors[`${path}.opcoes`];

  function updateOpcao(i: number, texto: string) {
    onChange({ ...pergunta, opcoes: pergunta.opcoes.map((o, idx) => (idx === i ? texto : o)) });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Pergunta {index + 1}</span>
          <Badge variant="secondary">{pergunta.tipo === "dissertativa" ? "Dissertativa" : "Múltipla escolha"}</Badge>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Mover pergunta ${index + 1} para cima`}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Mover pergunta ${index + 1} para baixo`}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remover pergunta ${index + 1}`}
          >
            <Trash2 className="text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${baseId}-enunciado`}>Pergunta</Label>
        <Textarea
          id={`${baseId}-enunciado`}
          rows={2}
          value={pergunta.enunciado}
          aria-invalid={Boolean(enunciadoError)}
          aria-describedby={enunciadoError ? `${baseId}-enunciado-erro` : undefined}
          onChange={(e) => onChange({ ...pergunta, enunciado: e.target.value })}
          placeholder="Escreva uma pergunta clara e direta"
        />
        {enunciadoError && <FieldError id={`${baseId}-enunciado-erro`}>{enunciadoError}</FieldError>}
      </div>

      {pergunta.tipo === "multipla_escolha" && (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Opções de resposta</legend>
          {pergunta.opcoes.map((opcao, i) => {
            const opcaoError = errors[`${path}.opcoes[${i}]`];
            return (
              <div key={i} className="space-y-1">
                <div className="flex gap-2">
                  <Input
                    aria-label={`Opção ${i + 1}`}
                    value={opcao}
                    aria-invalid={Boolean(opcaoError)}
                    onChange={(e) => updateOpcao(i, e.target.value)}
                    placeholder={`Opção ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange({ ...pergunta, opcoes: pergunta.opcoes.filter((_, idx) => idx !== i) })}
                    aria-label={`Remover opção ${i + 1}`}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
                {opcaoError && <FieldError>{opcaoError}</FieldError>}
              </div>
            );
          })}
          {opcoesError && <FieldError>{opcoesError}</FieldError>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...pergunta, opcoes: [...pergunta.opcoes, ""] })}
          >
            <Plus aria-hidden="true" />
            Adicionar opção
          </Button>
        </fieldset>
      )}
    </div>
  );
}
