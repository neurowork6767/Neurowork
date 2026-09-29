"use client";

import * as React from "react";
import { Library, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BANCO_PERGUNTAS, CATEGORIAS_BANCO, type CategoriaBanco } from "@/data/banco-perguntas";
import { cn, createId } from "@/lib/utils";
import type { Pergunta } from "@/types";

type BancoPerguntasDialogProps = {
  onAdicionar: (perguntas: Pergunta[]) => void;
};

/** Escolha de perguntas prontas do banco NeuroWork (RF-17). As cópias podem ser editadas depois. */
export function BancoPerguntasDialog({ onAdicionar }: BancoPerguntasDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [categoria, setCategoria] = React.useState<CategoriaBanco | "todas">("todas");
  const [selecionadas, setSelecionadas] = React.useState<string[]>([]);

  const lista = BANCO_PERGUNTAS.filter((p) => categoria === "todas" || p.categoria === categoria);

  function alternar(codigo: string) {
    setSelecionadas((atual) => (atual.includes(codigo) ? atual.filter((c) => c !== codigo) : [...atual, codigo]));
  }

  function adicionar() {
    const perguntas: Pergunta[] = BANCO_PERGUNTAS.filter((p) => selecionadas.includes(p.codigo)).map((modelo) => ({
      id: createId("prg"),
      enunciado: modelo.enunciado,
      tipo: modelo.tipo,
      opcoes: [...modelo.opcoes],
      orientacao: modelo.orientacao,
      exemplo: modelo.exemplo,
    }));
    onAdicionar(perguntas);
    setSelecionadas([]);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(valor) => {
        setOpen(valor);
        if (!valor) setSelecionadas([]);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Library aria-hidden="true" />
          Banco de perguntas NeuroWork
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Banco de perguntas NeuroWork</DialogTitle>
          <DialogDescription>
            Perguntas em linguagem clara, já com a explicação e um exemplo para o ajuste “passo a passo”. Depois de
            adicionar, você pode editar o texto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {(["todas", ...CATEGORIAS_BANCO] as const).map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={categoria === c ? "default" : "outline"}
              aria-pressed={categoria === c}
              onClick={() => setCategoria(c)}
            >
              {c === "todas" ? "Todas" : c}
            </Button>
          ))}
        </div>

        <fieldset className="-mx-1 mt-4 flex-1 space-y-2 overflow-y-auto px-1">
          <legend className="sr-only">Perguntas disponíveis</legend>
          {lista.map((p) => {
            const id = `banco-${p.codigo}`;
            const marcada = selecionadas.includes(p.codigo);
            return (
              <label
                key={p.codigo}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  marcada ? "border-primary bg-secondary/60" : "hover:bg-accent"
                )}
              >
                <Checkbox id={id} checked={marcada} onChange={() => alternar(p.codigo)} className="mt-0.5" />
                <span className="min-w-0 space-y-1">
                  <span className="block font-medium">{p.enunciado}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{p.tipo === "dissertativa" ? "Dissertativa" : "Múltipla escolha"}</Badge>
                    <Badge variant="outline">{p.categoria}</Badge>
                  </span>
                  {p.tipo === "multipla_escolha" && (
                    <span className="block text-sm text-muted-foreground">Opções: {p.opcoes.join(" · ")}</span>
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={adicionar} disabled={selecionadas.length === 0}>
            <Plus aria-hidden="true" />
            {selecionadas.length === 0
              ? "Escolha as perguntas"
              : `Adicionar ${selecionadas.length} ${selecionadas.length === 1 ? "pergunta" : "perguntas"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
