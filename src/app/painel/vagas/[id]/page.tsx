"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ListChecks, Lock, Pencil, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";

import { ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/vagas/confirm-dialog";
import { JobLinkCard } from "@/components/vagas/job-link-card";
import { VagaStatusBadge } from "@/components/vagas/status-badges";
import { useService } from "@/hooks/use-service";
import { MODALIDADE_LABEL } from "@/lib/constants";
import { alterarStatusVaga, obterVaga } from "@/lib/services";
import { formatDate } from "@/lib/utils";

/** Detalhe da vaga: link (FE09), encerrar e reabrir (FE08) */
export default function VagaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data: vaga, error, loading, reload, setData } = useService(() => obterVaga(id), [id]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  async function alternarStatus() {
    if (!vaga) return;
    const novoStatus = vaga.status === "aberta" ? "encerrada" : "aberta";
    try {
      const atualizada = await alterarStatusVaga(vaga.id, novoStatus);
      setData(() => atualizada);
      toast.success(novoStatus === "encerrada" ? "Vaga encerrada." : "Vaga reaberta.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar a vaga.");
    }
  }

  const voltar = (
    <Link href="/painel/vagas" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Voltar para vagas
    </Link>
  );

  if (loading) return <LoadingState label="Carregando vaga…" />;
  if (error || !vaga) {
    return (
      <ErrorState
        message={error ?? "Vaga não encontrada."}
        onRetry={reload}
        action={
          <Button asChild variant="ghost">
            <Link href="/painel/vagas">Voltar para vagas</Link>
          </Button>
        }
      />
    );
  }

  const aberta = vaga.status === "aberta";
  const totalPerguntas = vaga.etapas.reduce((acc, e) => acc + e.perguntas.length, 0);

  return (
    <>
      <PageHeader
        title={vaga.titulo}
        description={`${MODALIDADE_LABEL[vaga.modalidade]} · ${vaga.local} · criada em ${formatDate(vaga.criadaEm)}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/painel/vagas/${vaga.id}/editar`}>
                <Pencil aria-hidden="true" />
                Editar
              </Link>
            </Button>
            <Button variant={aberta ? "destructive" : "default"} onClick={() => setConfirmOpen(true)}>
              {aberta ? <Lock aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
              {aberta ? "Encerrar vaga" : "Reabrir vaga"}
            </Button>
          </>
        }
      >
        {voltar}
        <div className="pt-1">
          <VagaStatusBadge status={vaga.status} />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <JobLinkCard slug={vaga.slug} disabled={!aberta} />

          <Card>
            <CardHeader>
              <CardTitle as="h2">Sobre a vaga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Descrição</h3>
                <p className="whitespace-pre-line text-muted-foreground">{vaga.descricao}</p>
              </div>
              <div>
                <h3 className="font-medium">Requisitos</h3>
                <p className="whitespace-pre-line text-muted-foreground">{vaga.requisitos}</p>
              </div>
              {vaga.faixaSalarial && (
                <div>
                  <h3 className="font-medium">Salário</h3>
                  <p className="text-muted-foreground">{vaga.faixaSalarial}</p>
                </div>
              )}
              <div>
                <h3 className="mb-2 font-medium">Adaptações oferecidas</h3>
                <ul className="flex flex-wrap gap-2">
                  {vaga.adaptacoes.map((a) => (
                    <li key={a}>
                      <Badge variant="secondary">{a}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Processo seletivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {vaga.etapas.length === 0
                  ? "Nenhuma etapa criada. Sem etapas, o candidato só envia os dados e o currículo."
                  : `${vaga.etapas.length} ${vaga.etapas.length === 1 ? "etapa" : "etapas"} e ${totalPerguntas} ${totalPerguntas === 1 ? "pergunta" : "perguntas"}.`}
              </p>
              <Button asChild className="w-full">
                <Link href={`/painel/vagas/${vaga.id}/processo`}>
                  <ListChecks aria-hidden="true" />
                  {vaga.etapas.length === 0 ? "Montar processo" : "Editar processo"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/painel/candidatos?vaga=${vaga.id}`}>
                  <Users aria-hidden="true" />
                  Ver candidatos desta vaga
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={aberta ? "Encerrar esta vaga?" : "Reabrir esta vaga?"}
        description={
          aberta
            ? "O link deixará de aceitar candidaturas. As candidaturas recebidas continuam no painel. Você pode reabrir depois."
            : "O link voltará a aceitar novas candidaturas."
        }
        confirmLabel={aberta ? "Encerrar vaga" : "Reabrir vaga"}
        destructive={aberta}
        onConfirm={alternarStatus}
      />
    </>
  );
}
