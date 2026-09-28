"use client";

import type { ReactNode } from "react";
import { Mic, Square } from "lucide-react";

import { SpeakButton } from "@/components/accessibility/speak-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import type { Pergunta } from "@/types";

type QuestionFieldProps = {
  pergunta: Pergunta;
  numero: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Ajuste "passo a passo": mostra o que a empresa quer saber e um exemplo */
  passoAPasso?: boolean;
  /** Ajuste "responder falando": botão que transforma fala em texto */
  permitirFala?: boolean;
  /** Título maior quando a pergunta ocupa a tela sozinha */
  destaque?: boolean;
};

export function textoParaOuvir(pergunta: Pergunta, numero: number) {
  return pergunta.tipo === "multipla_escolha"
    ? `Pergunta ${numero}. ${pergunta.enunciado}. Opções: ${pergunta.opcoes.join("; ")}.`
    : `Pergunta ${numero}. ${pergunta.enunciado}`;
}

function Orientacao({ pergunta }: { pergunta: Pergunta }) {
  const padrao =
    pergunta.tipo === "multipla_escolha"
      ? "Escolha uma das opções abaixo. Só uma resposta é possível."
      : "Responda com as suas palavras. Frases curtas estão ótimas.";

  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-xl bg-secondary p-4 text-secondary-foreground">
        <p className="font-semibold">O que a empresa quer saber</p>
        <p className="whitespace-pre-line text-foreground">{pergunta.orientacao.trim() || padrao}</p>
        <p className="font-medium text-foreground">Não existe resposta errada.</p>
      </div>
      {pergunta.exemplo.trim() && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Exemplo de resposta</p>
          <p className="rounded-lg border bg-muted/60 p-3">{pergunta.exemplo}</p>
        </div>
      )}
    </div>
  );
}

function BotaoFalar({ onTexto }: { onTexto: (texto: string) => void }) {
  const { suportado, ouvindo, erro, iniciar, parar } = useSpeechRecognition(onTexto);
  if (!suportado) return null;

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={ouvindo ? "destructive" : "secondary"}
        onClick={ouvindo ? parar : iniciar}
        aria-pressed={ouvindo}
      >
        {ouvindo ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
        {ouvindo ? "Parar de ouvir" : "Responder falando"}
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {erro ?? (ouvindo ? "Ouvindo… fale sua resposta. Você pode corrigir o texto depois." : "")}
      </p>
    </div>
  );
}

/**
 * Exibe uma pergunta como o candidato vê (FE18), já com os ajustes escolhidos.
 * Também é usada na pré-visualização do processo seletivo (FE11).
 */
export function QuestionField({
  pergunta,
  numero,
  value,
  onChange,
  disabled,
  passoAPasso = false,
  permitirFala = false,
  destaque = false,
}: QuestionFieldProps) {
  const id = `pergunta-${pergunta.id}`;
  const tituloClass = cn("font-medium", destaque ? "font-heading text-2xl font-bold text-navy" : "text-lg");

  const cabecalho = (titulo: ReactNode) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      {titulo}
      <SpeakButton text={textoParaOuvir(pergunta, numero)} className="shrink-0" />
    </div>
  );

  if (pergunta.tipo === "multipla_escolha") {
    return (
      <div role="radiogroup" aria-labelledby={`${id}-titulo`} className="space-y-4">
        {cabecalho(
          <p id={`${id}-titulo`} className={tituloClass}>
            <span className="text-muted-foreground">{numero}. </span>
            {pergunta.enunciado}
          </p>
        )}
        {passoAPasso && <Orientacao pergunta={pergunta} />}
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
    <div className="space-y-4">
      {cabecalho(
        <label htmlFor={id} className={tituloClass}>
          <span className="text-muted-foreground">{numero}. </span>
          {pergunta.enunciado}
        </label>
      )}
      {passoAPasso && <Orientacao pergunta={pergunta} />}
      {permitirFala && !disabled && <BotaoFalar onTexto={(texto) => onChange(value ? `${value} ${texto}` : texto)} />}
      <Textarea
        id={id}
        rows={destaque ? 7 : 5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escreva sua resposta aqui"
      />
    </div>
  );
}
