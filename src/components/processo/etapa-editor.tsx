"use client";

import { AlignLeft, ArrowDown, ArrowUp, ListChecks, Trash2 } from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createId, moveItem } from "@/lib/utils";
import type { Etapa, Pergunta, TipoPergunta } from "@/types";
import { PerguntaEditor } from "./pergunta-editor";

type EtapaEditorProps = {
  etapa: Etapa;
  index: number;
  total: number;
  errors: Record<string, string>;
  onChange: (etapa: Etapa) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

/** Editor de uma etapa do processo seletivo (FE11) */
export function EtapaEditor({ etapa, index, total, errors, onChange, onRemove, onMove }: EtapaEditorProps) {
  const path = `etapas[${index}]`;
  const baseId = `etapa-${etapa.id}`;
  const tituloError = errors[`${path}.titulo`];
  const instrucoesError = errors[`${path}.instrucoes`];
  const perguntasError = errors[`${path}.perguntas`];

  function addPergunta(tipo: TipoPergunta) {
    const nova: Pergunta = {
      id: createId("prg"),
      enunciado: "",
      tipo,
      opcoes: tipo === "multipla_escolha" ? ["", ""] : [],
      orientacao: "",
      exemplo: "",
    };
    onChange({ ...etapa, perguntas: [...etapa.perguntas, nova] });
  }

  function updatePergunta(i: number, pergunta: Pergunta) {
    onChange({ ...etapa, perguntas: etapa.perguntas.map((p, idx) => (idx === i ? pergunta : p)) });
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 border-b pb-4">
        <h2 className="text-lg font-semibold">
          Etapa {index + 1}
          {etapa.titulo && <span className="font-normal text-muted-foreground">: {etapa.titulo}</span>}
        </h2>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Mover etapa ${index + 1} para cima`}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Mover etapa ${index + 1} para baixo`}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRemove}
            aria-label={`Remover etapa ${index + 1}`}
          >
            <Trash2 className="text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="space-y-2">
          <Label htmlFor={`${baseId}-titulo`}>Título da etapa</Label>
          <Input
            id={`${baseId}-titulo`}
            value={etapa.titulo}
            aria-invalid={Boolean(tituloError)}
            aria-describedby={tituloError ? `${baseId}-titulo-erro` : undefined}
            onChange={(e) => onChange({ ...etapa, titulo: e.target.value })}
            placeholder="Ex.: Conhecimentos técnicos"
          />
          {tituloError && <FieldError id={`${baseId}-titulo-erro`}>{tituloError}</FieldError>}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${baseId}-instrucoes`}>
            Instruções para o candidato <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id={`${baseId}-instrucoes`}
            rows={2}
            value={etapa.instrucoes}
            aria-invalid={Boolean(instrucoesError)}
            onChange={(e) => onChange({ ...etapa, instrucoes: e.target.value })}
            placeholder="Ex.: Responda com calma. Não há limite de tempo."
          />
          {instrucoesError && <FieldError>{instrucoesError}</FieldError>}
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Perguntas</h3>
          {etapa.perguntas.map((pergunta, i) => (
            <PerguntaEditor
              key={pergunta.id}
              pergunta={pergunta}
              index={i}
              total={etapa.perguntas.length}
              path={`${path}.perguntas[${i}]`}
              errors={errors}
              onChange={(p) => updatePergunta(i, p)}
              onRemove={() => onChange({ ...etapa, perguntas: etapa.perguntas.filter((_, idx) => idx !== i) })}
              onMove={(direction) => onChange({ ...etapa, perguntas: moveItem(etapa.perguntas, i, direction) })}
            />
          ))}
          {perguntasError && <FieldError>{perguntasError}</FieldError>}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => addPergunta("dissertativa")}>
              <AlignLeft aria-hidden="true" />
              Pergunta dissertativa
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => addPergunta("multipla_escolha")}>
              <ListChecks aria-hidden="true" />
              Pergunta de múltipla escolha
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
