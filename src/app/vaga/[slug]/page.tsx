"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, Clock, HeartHandshake, MapPin, Wallet } from "lucide-react";

import { SpeakButton } from "@/components/accessibility/speak-button";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useService } from "@/hooks/use-service";
import { readCandidateProgress } from "@/lib/candidate-session";
import { MODALIDADE_LABEL } from "@/lib/constants";
import { obterVagaPublica } from "@/lib/services";

/** Página pública da vaga, acessada pelo link, sem conta (FE16) */
export default function VagaPublicaPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: vaga, error, loading, reload } = useService(() => obterVagaPublica(slug), [slug]);
  const [progresso, setProgresso] = React.useState<ReturnType<typeof readCandidateProgress>>(null);

  React.useEffect(() => {
    setProgresso(readCandidateProgress(slug));
  }, [slug]);

  if (loading) return <LoadingState label="Abrindo a vaga…" />;
  if (error || !vaga) {
    return (
      <ErrorState title="Não foi possível abrir a vaga" message={error ?? "Vaga não encontrada."} onRetry={reload} />
    );
  }

  const totalPerguntas = vaga.etapas.reduce((acc, e) => acc + e.perguntas.length, 0);
  const textoParaOuvir = `Vaga: ${vaga.titulo}, na empresa ${vaga.empresaNome}. ${vaga.descricao} Requisitos: ${vaga.requisitos}`;

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4" aria-hidden="true" />
          {vaga.empresaNome}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-navy">{vaga.titulo}</h1>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <MapPin className="size-4" aria-hidden="true" />
            {MODALIDADE_LABEL[vaga.modalidade]} · {vaga.local}
          </li>
          {vaga.faixaSalarial && (
            <li className="flex items-center gap-2">
              <Wallet className="size-4" aria-hidden="true" />
              {vaga.faixaSalarial}
            </li>
          )}
        </ul>
        <SpeakButton text={textoParaOuvir} label="Ouvir a descrição da vaga" />
      </header>

      {progresso && (
        <FormAlert variant={progresso.avaliacaoConcluida ? "success" : "info"}>
          {progresso.avaliacaoConcluida ? (
            "Você já enviou sua candidatura para esta vaga."
          ) : (
            <>
              Você já começou sua candidatura.{" "}
              <Link href={`/vaga/${slug}/avaliacao`} className="font-semibold text-primary underline">
                Continuar a avaliação
              </Link>
            </>
          )}
        </FormAlert>
      )}

      <Card>
        <CardHeader>
          <CardTitle as="h2">Sobre a vaga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-line">{vaga.descricao}</p>
          <div>
            <h3 className="font-semibold">Requisitos</h3>
            <p className="whitespace-pre-line">{vaga.requisitos}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
            Adaptações oferecidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {vaga.adaptacoes.map((a) => (
              <li key={a} className="flex gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Como funciona a candidatura</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li>
              <strong>1. Seus dados:</strong> nome, contato e cidade. Você não precisa criar conta.
            </li>
            <li>
              <strong>2. Arquivos:</strong> currículo em PDF e, se quiser, portfólio.
            </li>
            {vaga.etapas.length > 0 && (
              <li>
                <strong>3. Avaliação:</strong> {vaga.etapas.length} {vaga.etapas.length === 1 ? "etapa" : "etapas"} com{" "}
                {totalPerguntas} {totalPerguntas === 1 ? "pergunta" : "perguntas"}.
              </li>
            )}
          </ol>
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-secondary p-3 text-secondary-foreground">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            Não existe limite de tempo. Você pode voltar e revisar as respostas antes de enviar.
          </p>
        </CardContent>
      </Card>

      {!progresso && (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/vaga/${slug}/candidatura`}>
            Quero me candidatar
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      )}
    </article>
  );
}
