"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Coffee, Pause, Send, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { QuestionField, textoParaOuvir } from "@/components/processo/question-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/vagas/confirm-dialog";
import { useService } from "@/hooks/use-service";
import type { AjusteId } from "@/lib/ajustes";
import { readCandidateProgress, updateCandidateProgress } from "@/lib/candidate-session";
import { obterVagaPublica, salvarRespostas } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { Etapa, Pergunta } from "@/types";

/** Uma "tela" da avaliação: uma etapa inteira ou, no modo foco, uma única pergunta. */
type Tela = {
  etapa: Etapa;
  etapaIndex: number;
  perguntas: { pergunta: Pergunta; numero: number }[];
  resumo: string;
};

function montarTelas(etapas: Etapa[], umaPorTela: boolean): Tela[] {
  let numero = 0;
  const numeradas = etapas.map((etapa, etapaIndex) => ({
    etapa,
    etapaIndex,
    perguntas: etapa.perguntas.map((pergunta) => ({ pergunta, numero: ++numero })),
  }));

  if (!umaPorTela) {
    return numeradas.map((t) => ({ ...t, resumo: t.etapa.titulo }));
  }
  return numeradas.flatMap((t) =>
    t.perguntas.map((item) => ({
      etapa: t.etapa,
      etapaIndex: t.etapaIndex,
      perguntas: [item],
      resumo: `${item.pergunta.tipo === "multipla_escolha" ? "Múltipla escolha" : "Pergunta aberta"}: ${item.pergunta.enunciado}`,
    }))
  );
}

/** Avaliação adaptada aos ajustes escolhidos pelo candidato (FE18) */
export default function AvaliacaoPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: vaga, error, loading, reload } = useService(() => obterVagaPublica(slug), [slug]);

  const [candidaturaId, setCandidaturaId] = React.useState<string | null>(null);
  const [ajustes, setAjustes] = React.useState<AjusteId[]>([]);
  const [checked, setChecked] = React.useState(false);
  const [posicao, setPosicao] = React.useState(0);
  const [respostas, setRespostas] = React.useState<Record<string, string>>({});
  const [pausado, setPausado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // Recupera candidatura, ajustes e rascunho salvos nesta aba
  React.useEffect(() => {
    const progresso = readCandidateProgress(slug);
    if (progresso?.avaliacaoConcluida) {
      router.replace(`/vaga/${slug}/concluido`);
      return;
    }
    if (progresso && !progresso.ajustesDefinidos) {
      router.replace(`/vaga/${slug}/ajustes`);
      return;
    }
    if (progresso) {
      setCandidaturaId(progresso.candidaturaId);
      setAjustes(progresso.ajustes);
      setRespostas(progresso.rascunho);
      setPosicao(progresso.posicao);
    }
    setChecked(true);
  }, [slug, router]);

  const tem = React.useCallback((ajuste: AjusteId) => ajustes.includes(ajuste), [ajustes]);
  const telas = React.useMemo(() => montarTelas(vaga?.etapas ?? [], tem("uma_por_tela")), [vaga, tem]);
  const indice = Math.min(posicao, Math.max(telas.length - 1, 0));
  const tela = telas[indice];

  // Ajuste "ler em voz alta": lê a pergunta sempre que a tela muda
  React.useEffect(() => {
    if (!tela || pausado || !tem("ler_em_voz_alta") || !("speechSynthesis" in window)) return;
    const texto = tela.perguntas.map((p) => textoParaOuvir(p.pergunta, p.numero)).join(" ");
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(fala);
    return () => window.speechSynthesis.cancel();
  }, [tela, pausado, tem]);

  function responder(perguntaId: string, valor: string) {
    const novas = { ...respostas, [perguntaId]: valor };
    setRespostas(novas);
    updateCandidateProgress(slug, { rascunho: novas });
  }

  async function salvarParcial() {
    if (!candidaturaId) return;
    try {
      await salvarRespostas(candidaturaId, respostas, false);
    } catch {
      // O rascunho continua guardado no navegador; o envio final tenta de novo
    }
  }

  function irPara(novoIndice: number) {
    setPosicao(novoIndice);
    updateCandidateProgress(slug, { posicao: novoIndice });
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function pausar() {
    setPausado(true);
    await salvarParcial();
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
  if (error || !vaga) {
    return (
      <ErrorState
        title="Não foi possível abrir a avaliação"
        message={error ?? "Vaga não encontrada."}
        onRetry={reload}
      />
    );
  }

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

  if (!tela) {
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

  const umaPorTela = tem("uma_por_tela");
  const ultima = indice >= telas.length - 1;
  const unidade = umaPorTela ? "Pergunta" : "Etapa";
  const totalPerguntas = telas.reduce((acc, t) => acc + t.perguntas.length, 0);
  const semResposta = telas
    .flatMap((t) => t.perguntas)
    .filter(({ pergunta }) => !respostas[pergunta.id]?.trim()).length;

  if (pausado) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center" role="status">
        <Coffee className="size-12 text-brand-blue" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-navy">Você está em pausa</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Suas respostas estão salvas. Não existe limite de tempo: continue quando se sentir pronto(a).
        </p>
        <Button size="lg" onClick={() => setPausado(false)}>
          Continuar a avaliação
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-6",
        // Ajuste "texto maior": letras maiores, mais espaço entre linhas, letras e palavras, fundo creme
        tem("texto_maior") &&
          "-mx-4 rounded-2xl bg-[#FBF8F1] px-4 py-6 text-[1.15rem] leading-[1.9] tracking-[0.03em] [word-spacing:0.12em] sm:-mx-6 sm:px-6"
      )}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">
            {unidade} {indice + 1} de {telas.length}
            <span className="font-normal text-muted-foreground"> · faltam {telas.length - indice - 1}</span>
          </p>
          <div className="flex gap-2">
            {tem("pausa") && (
              <Button variant="outline" size="sm" onClick={pausar}>
                <Pause aria-hidden="true" />
                Fazer uma pausa
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link href={`/vaga/${slug}/ajustes`}>
                <SlidersHorizontal aria-hidden="true" />
                Ajustes
              </Link>
            </Button>
          </div>
        </div>
        {umaPorTela ? (
          <div className="flex gap-1.5" aria-hidden="true">
            {telas.map((t, i) => (
              <div
                key={`${t.etapa.id}-${i}`}
                className={cn("h-2.5 flex-1 rounded-full", i <= indice ? "bg-primary" : "bg-muted")}
              />
            ))}
          </div>
        ) : (
          <Progress
            value={Math.round(((indice + 1) / telas.length) * 100)}
            label={`Progresso: ${unidade.toLowerCase()} ${indice + 1} de ${telas.length}`}
          />
        )}
        <p className="text-sm text-muted-foreground">Sem limite de tempo.</p>
      </div>

      {tem("passo_a_passo") && (
        <section aria-label="Onde você está" className="space-y-2 rounded-xl border bg-card p-4">
          <p className="font-semibold">
            Você está aqui: {unidade.toLowerCase()} {indice + 1} de {telas.length}
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            {telas.map((t, i) => (
              <li
                key={`${t.etapa.id}-${i}`}
                className={i === indice ? "font-semibold text-primary" : "text-muted-foreground"}
              >
                <span className="block truncate">
                  {t.resumo}
                  {i === indice && <span className="sr-only"> (agora)</span>}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            São {totalPerguntas} {totalPerguntas === 1 ? "pergunta" : "perguntas"} no total. Depois delas, a candidatura
            termina.
          </p>
        </section>
      )}

      <Card>
        <CardHeader>
          {!umaPorTela && (
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-navy focus:outline-none">
              {tela.etapa.titulo}
            </h1>
          )}
          {umaPorTela && (
            <h1 ref={headingRef} tabIndex={-1} className="text-sm font-medium text-muted-foreground focus:outline-none">
              Etapa {tela.etapaIndex + 1}: {tela.etapa.titulo}
            </h1>
          )}
          {tela.etapa.instrucoes && <CardDescription className="text-base">{tela.etapa.instrucoes}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-10">
          {tela.perguntas.map(({ pergunta, numero }) => (
            <QuestionField
              key={pergunta.id}
              pergunta={pergunta}
              numero={numero}
              value={respostas[pergunta.id] ?? ""}
              onChange={(valor) => responder(pergunta.id, valor)}
              passoAPasso={tem("passo_a_passo")}
              permitirFala={tem("responder_falando")}
              destaque={umaPorTela}
            />
          ))}
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-sm text-success">
        <Check className="size-4" aria-hidden="true" />
        Suas respostas são salvas automaticamente. Você pode voltar e revisar antes de enviar.
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {indice > 0 ? (
          <Button variant="outline" size="lg" onClick={() => irPara(indice - 1)} disabled={enviando}>
            <ArrowLeft aria-hidden="true" />
            Anterior
          </Button>
        ) : (
          <span />
        )}
        {ultima ? (
          <Button size="lg" onClick={() => (semResposta > 0 ? setConfirmOpen(true) : enviar())} loading={enviando}>
            {!enviando && <Send aria-hidden="true" />}
            {enviando ? "Enviando…" : "Enviar respostas"}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={async () => {
              await salvarParcial();
              irPara(indice + 1);
            }}
          >
            {umaPorTela ? `Ir para a pergunta ${indice + 2} de ${telas.length}` : "Próxima etapa"}
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
