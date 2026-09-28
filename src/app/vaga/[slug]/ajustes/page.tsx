"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { QuestionField } from "@/components/processo/question-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useService } from "@/hooks/use-service";
import { AJUSTES, ATALHOS, type AjusteId, type AtalhoId } from "@/lib/ajustes";
import { readCandidateProgress, updateCandidateProgress, type CandidateProgress } from "@/lib/candidate-session";
import { compartilharAjustes, obterVagaPublica } from "@/lib/services";
import { cn } from "@/lib/utils";

/** Antes da avaliação: o candidato escolhe como prefere fazê-la. */
export default function AjustesPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: vaga, error, loading, reload } = useService(() => obterVagaPublica(slug), [slug]);

  const [progresso, setProgresso] = React.useState<CandidateProgress | null>(null);
  const [checked, setChecked] = React.useState(false);
  // O atalho fica só na memória desta tela: não é salvo nem enviado
  const [atalho, setAtalho] = React.useState<AtalhoId | null>(null);
  const [ajustes, setAjustes] = React.useState<AjusteId[]>([]);
  const [compartilhar, setCompartilhar] = React.useState(false);
  const [mostrarExemplo, setMostrarExemplo] = React.useState(false);
  const [respostaExemplo, setRespostaExemplo] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    const atual = readCandidateProgress(slug);
    if (atual?.avaliacaoConcluida) {
      router.replace(`/vaga/${slug}/concluido`);
      return;
    }
    if (atual) {
      setProgresso(atual);
      setAjustes(atual.ajustes);
    }
    setChecked(true);
  }, [slug, router]);

  function escolherAtalho(id: AtalhoId) {
    setAtalho(id);
    const sugestao = ATALHOS.find((a) => a.id === id)?.sugestao ?? [];
    if (id !== "manual") setAjustes(sugestao);
  }

  function alternarAjuste(id: AjusteId) {
    setAjustes((atuais) => (atuais.includes(id) ? atuais.filter((a) => a !== id) : [...atuais, id]));
  }

  async function comecar() {
    if (!progresso) return;
    setSalvando(true);
    try {
      // Sem a permissão do candidato, nada é compartilhado (lista vazia)
      await compartilharAjustes(progresso.candidaturaId, compartilhar ? ajustes : []);
      updateCandidateProgress(slug, { ajustes, ajustesDefinidos: true, posicao: 0 });
      router.push(`/vaga/${slug}/avaliacao`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar. Tente de novo.");
      setSalvando(false);
    }
  }

  if (loading || !checked) return <LoadingState label="Carregando…" />;
  if (error || !vaga) {
    return (
      <ErrorState title="Não foi possível abrir a vaga" message={error ?? "Vaga não encontrada."} onRetry={reload} />
    );
  }
  if (!progresso) {
    return (
      <EmptyState
        title="Comece pela sua candidatura"
        description="Primeiro envie seus dados na página da vaga. Depois você escolhe como prefere fazer a avaliação."
        action={
          <Button asChild>
            <Link href={`/vaga/${slug}`}>Ir para a vaga</Link>
          </Button>
        }
      />
    );
  }

  const primeiraPergunta = vaga.etapas.flatMap((e) => e.perguntas)[0];
  const tem = (id: AjusteId) => ajustes.includes(id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{vaga.titulo} · Antes da avaliação</p>
        <h1 className="text-3xl font-extrabold text-navy">Como você prefere fazer a avaliação?</h1>
        <p className="text-lg text-muted-foreground">
          As perguntas são as mesmas para todos. O que muda é o jeito de mostrar e de responder. Você pode mudar isso a
          qualquer momento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Atalho: escolha uma condição (opcional)</CardTitle>
          <CardDescription>
            Sugerimos ajustes que costumam ajudar. São só sugestões: cada pessoa é diferente, e você confere abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {ATALHOS.map((a) => {
              const ativo = atalho === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => escolherAtalho(a.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    ativo ? "border-2 border-primary bg-secondary text-secondary-foreground" : "hover:bg-accent"
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
          <p className="flex items-start gap-2 rounded-lg bg-success/10 p-3 text-sm text-foreground">
            <Lock className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span>
              <strong>Essa escolha não sai desta tela.</strong> Ela não é salva no sistema e não é enviada para a
              empresa. Serve apenas para marcar os ajustes abaixo.
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Ajustes que vamos usar</CardTitle>
          <CardDescription>Marque quantos quiser. Nenhum é obrigatório.</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-2">
            <legend className="sr-only">Ajustes da avaliação</legend>
            {AJUSTES.map((ajuste) => (
              <label
                key={ajuste.id}
                htmlFor={`ajuste-${ajuste.id}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-secondary/60"
              >
                <Checkbox
                  id={`ajuste-${ajuste.id}`}
                  checked={tem(ajuste.id)}
                  onChange={() => alternarAjuste(ajuste.id)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-medium">{ajuste.label}</span>
                  <span className="block text-sm text-muted-foreground">{ajuste.descricao}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <label htmlFor="compartilhar" className="flex cursor-pointer items-start gap-3">
            <Checkbox
              id="compartilhar"
              checked={compartilhar}
              onChange={(e) => setCompartilhar(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="block font-medium">Mostrar para a empresa os ajustes que escolhi (opcional)</span>
              <span className="block text-sm text-muted-foreground">
                Ajuda a empresa a preparar a entrevista do jeito que funciona para você. A empresa vê apenas os nomes
                dos ajustes, nunca uma condição ou diagnóstico.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {primeiraPergunta && (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setMostrarExemplo((v) => !v)} aria-expanded={mostrarExemplo}>
            {mostrarExemplo ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {mostrarExemplo ? "Esconder o exemplo" : "Ver como vai ficar"}
          </Button>

          {mostrarExemplo && (
            <section
              aria-label="Exemplo com os ajustes escolhidos"
              className={cn(
                "space-y-4 rounded-2xl border-2 border-dashed border-input p-5",
                tem("texto_maior") &&
                  "bg-[#FBF8F1] text-[1.15rem] leading-[1.9] tracking-[0.03em] [word-spacing:0.12em]"
              )}
            >
              <p className="text-sm font-medium text-muted-foreground">
                Exemplo com a 1ª pergunta. O que você escrever aqui não é enviado.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                {tem("uma_por_tela") && <span className="rounded-full bg-muted px-3 py-1">Uma pergunta por tela</span>}
                {tem("pausa") && <span className="rounded-full bg-muted px-3 py-1">Botão de pausa no topo</span>}
                {tem("ler_em_voz_alta") && (
                  <span className="rounded-full bg-muted px-3 py-1">A pergunta será lida em voz alta</span>
                )}
              </div>
              <QuestionField
                pergunta={primeiraPergunta}
                numero={1}
                value={respostaExemplo}
                onChange={setRespostaExemplo}
                passoAPasso={tem("passo_a_passo")}
                permitirFala={tem("responder_falando")}
                destaque={tem("uma_por_tela")}
              />
            </section>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button size="lg" onClick={comecar} loading={salvando}>
          Começar a avaliação
          {!salvando && <ArrowRight aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}
