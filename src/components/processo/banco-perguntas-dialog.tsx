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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BANCO_PERGUNTAS, CATEGORIAS_AREAS, CATEGORIAS_GERAIS, type CategoriaBanco } from "@/data/banco-perguntas";
import { cn, createId } from "@/lib/utils";
import type { Pergunta } from "@/types";

type BancoPerguntasDialogProps = {
  onAdicionar: (perguntas: Pergunta[]) => void;
};

/** Busca sem diferença entre maiúsculas e acentos ("organizacao" encontra "Organização"). */
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function quantidade(categoria: CategoriaBanco) {
  return BANCO_PERGUNTAS.filter((p) => p.categoria === categoria).length;
}

/** Escolha de perguntas prontas do banco NeuroWork (RF-17). As cópias podem ser editadas depois. */
export function BancoPerguntasDialog({ onAdicionar }: BancoPerguntasDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [categoria, setCategoria] = React.useState<CategoriaBanco | "todas">("todas");
  const [busca, setBusca] = React.useState("");
  const [selecionadas, setSelecionadas] = React.useState<string[]>([]);

  const termo = normalizar(busca.trim());
  const lista = BANCO_PERGUNTAS.filter(
    (p) =>
      (categoria === "todas" || p.categoria === categoria) &&
      (!termo || normalizar(`${p.enunciado} ${p.categoria}`).includes(termo))
  );

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
        if (!valor) {
          setSelecionadas([]);
          setBusca("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Library aria-hidden="true" />
          Banco de perguntas NeuroWork
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Banco de perguntas NeuroWork</DialogTitle>
          <DialogDescription>
            Perguntas em linguagem clara para qualquer vaga e para cada área de trabalho, já com a explicação e um
            exemplo para o ajuste “passo a passo”. Depois de adicionar, você pode editar o texto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="banco-categoria">Tipo de pergunta</Label>
            <Select
              id="banco-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaBanco | "todas")}
            >
              <option value="todas">Todas ({BANCO_PERGUNTAS.length})</option>
              <optgroup label="Para qualquer vaga">
                {CATEGORIAS_GERAIS.map((c) => (
                  <option key={c} value={c}>
                    {c} ({quantidade(c)})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Por área de trabalho">
                {CATEGORIAS_AREAS.map((c) => (
                  <option key={c} value={c}>
                    {c} ({quantidade(c)})
                  </option>
                ))}
              </optgroup>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="banco-busca">Buscar</Label>
            <Input
              id="banco-busca"
              type="search"
              placeholder="Ex.: estoque, cliente, planilha"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {lista.length === 1 ? "1 pergunta encontrada" : `${lista.length} perguntas encontradas`}
          {selecionadas.length > 0 && ` · ${selecionadas.length} escolhida${selecionadas.length === 1 ? "" : "s"}`}
        </p>

        {/* min-h-0 deixa a lista encolher e rolar dentro da janela, sem passar por cima dos botões */}
        <div
          role="group"
          aria-label="Perguntas disponíveis"
          className="-mx-1 mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto px-1 pb-1"
        >
          {lista.length === 0 && (
            <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              Nenhuma pergunta encontrada. Tente outra palavra ou escolha &quot;Todas&quot;.
            </p>
          )}
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
        </div>

        <DialogFooter className="mt-4 shrink-0 border-t pt-4">
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
