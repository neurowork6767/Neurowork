"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";

import { SpeakButton } from "@/components/accessibility/speak-button";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { QuestionField } from "@/components/processo/question-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/vagas/confirm-dialog";
import { useService } from "@/hooks/use-service";
import { readCandidateProgress, updateCandidateProgress } from "@/lib/candidate-session";
import { obterVagaPublica, salvarRespostas } from "@/lib/services";

/** Avaliação etapa por etapa, sem cronômetro (FE18) */
export default function AvaliacaoPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: vaga, error, loading, reload } = useService(() => obterVagaPublica(slug), [slug]);

  const [candidaturaId, setCandidaturaId] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState(false);
  const [etapaAtual, setEtapaAtual] = React.useState(0);
  const [respostas, setRespostas] = React.useState<Record<string, string>>({});
  const [enviando, setEnviando] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // Recupera a candidatura e o rascunho salvos nesta aba
  React.useEffect(() => {
    const progresso = readCandidateProgress(slug);
    if (progresso?.avaliacaoConcluida) {
      router.replace(`/vaga/${slug}/concluido`);
      return;
    }
    if (progresso) {
      setCandidaturaId(progresso.candidaturaId);
      setRespostas(progresso.rascunho);
      setEtapaAtual(progresso.etapaAtual);
    }
    setChecked(true);
  }, [slug, router]);

  function responder(perguntaId: string, valor: string) {
    const novas = { ...respostas, [perguntaId]: valor };
    setRespostas(novas);
    updateCandidateProgress(slug, { rascunho: novas });
  }

  function irPara(index: number) {
    setEtapaAtual(index);
    updateCandidateProgress(slug, { etapaAtual: index });
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function avancar() {
    if (!candidaturaId) return;
    try {
      // Salva o progresso parcial; se falhar, o rascunho continua guardado no navegador
      await salvarRespostas(candidaturaId, respostas, false);
    } catch {
      // segue normalmente: o envio final tenta de novo
    }
    irPara(etapaAtual + 1);
  }

  async function enviar() {
    if (!candidaturaId) return;
    setEnviando(true);
    try {
      await salvarRespostas(candidaturaId, respostas, true);
      updateCandidateProgress(slug, { avaliacaoConcluida: true });
      router.push(`/vaga/${slug}/concluido`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível enviar. Suas respostas continuam salvas; tente de novo."
      );
      setEnviando(false);
    }
  }

  if (loading || !checked) return <LoadingState label="Carregando avaliação…" />;
  if (error || !vaga)
    return (
      <ErrorState
        title="Não foi possível abrir a avaliação"
        message={error ?? "Vaga não encontrada."}
        onRetry={reload}
      />
    );

  if (!candidaturaId) {
    return (
      <EmptyState
        title="Comece pela sua candidatura"
        description="Para responder à avaliação, primeiro envie seus dados na página da vaga."
        action={
          <Button asChild>
            <Link href={`/vaga/${slug}`}>Ir para a vaga</Link>
          </Button>
        }
      />
    );
  }

  const etapas = vaga.etapas;
  const etapa = etapas[Math.min(etapaAtual, etapas.length - 1)];
  if (!etapa) {
    return (
      <EmptyState
        title="Esta vaga não tem avaliação"
        action={
          <Button asChild>
            <Link href={`/vaga/${slug}/concluido`}>Concluir</Link>
          </Button>
        }
      />
    );
  }

  const ultima = etapaAtual >= etapas.length - 1;
  const progresso = Math.round(((etapaAtual + 1) / etapas.length) * 100);
  const semResposta = etapas.flatMap((e) => e.perguntas).filter((p) => !respostas[p.id]?.trim()).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">
            Etapa {etapaAtual + 1} de {etapas.length}
          </p>
          <p className="text-muted-foreground">Sem limite de tempo</p>
        </div>
        <Progress value={progresso} label={`Progresso: etapa ${etapaAtual + 1} de ${etapas.length}`} />
      </div>

      <Card>
        <CardHeader>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-navy focus:outline-none">
            {etapa.titulo}
          </h1>
          {etapa.instrucoes && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <CardDescription className="text-base">{etapa.instrucoes}</CardDescription>
              <SpeakButton text={etapa.instrucoes} label="Ouvir instruções" className="shrink-0" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {etapa.perguntas.map((pergunta, i) => (
            <QuestionField
              key={pergunta.id}
              pergunta={pergunta}
              numero={i + 1}
              value={respostas[pergunta.id] ?? ""}
              onChange={(valor) => responder(pergunta.id, valor)}
            />
          ))}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Suas respostas ficam guardadas enquanto você navega entre as etapas.
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {etapaAtual > 0 ? (
          <Button variant="outline" onClick={() => irPara(etapaAtual - 1)} disabled={enviando}>
            <ArrowLeft aria-hidden="true" />
            Etapa anterior
          </Button>
        ) : (
          <span />
        )}
        {ultima ? (
          <Button onClick={() => (semResposta > 0 ? setConfirmOpen(true) : enviar())} loading={enviando}>
            {!enviando && <Send aria-hidden="true" />}
            {enviando ? "Enviando…" : "Enviar respostas"}
          </Button>
        ) : (
          <Button onClick={avancar}>
            Próxima etapa
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Enviar mesmo assim?"
        description={`${semResposta} ${semResposta === 1 ? "pergunta ficou" : "perguntas ficaram"} sem resposta. Você pode voltar e responder, ou enviar assim mesmo.`}
        confirmLabel="Enviar respostas"
        onConfirm={enviar}
      />
    </div>
  );
}
