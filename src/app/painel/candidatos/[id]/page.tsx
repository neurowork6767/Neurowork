"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CandidaturaStatusBadge } from "@/components/vagas/status-badges";
import { useService } from "@/hooks/use-service";
import { CANDIDATURA_STATUS_LABEL, STATUS_SELECIONAVEIS } from "@/lib/constants";
import { alterarStatusCandidatura, obterCandidatura } from "@/lib/services";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { ArquivoInfo, CandidaturaStatus } from "@/types";

function Arquivo({ label, arquivo }: { label: string; arquivo: ArquivoInfo }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{arquivo.nome}</p>
        <p className="text-xs text-muted-foreground">PDF · {formatFileSize(arquivo.tamanho)}</p>
      </div>
    </div>
  );
}

/** Detalhe do candidato e alteração de status (FE13) */
export default function CandidatoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data: candidatura, error, loading, reload, setData } = useService(() => obterCandidatura(id), [id]);
  const [novoStatus, setNovoStatus] = React.useState<CandidaturaStatus>("em_analise");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (candidatura) setNovoStatus(candidatura.status === "nova" ? "em_analise" : candidatura.status);
  }, [candidatura]);

  async function handleStatus(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await alterarStatusCandidatura(id, novoStatus);
      setData((atual) => ({ ...atual, status: novoStatus }));
      toast.success(`Status alterado para “${CANDIDATURA_STATUS_LABEL[novoStatus]}”.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar o status.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Carregando candidatura…" />;
  if (error || !candidatura) {
    return (
      <ErrorState
        message={error ?? "Candidatura não encontrada."}
        onRetry={reload}
        action={
          <Button asChild variant="ghost">
            <Link href="/painel/candidatos">Voltar para candidatos</Link>
          </Button>
        }
      />
    );
  }

  const { vaga } = candidatura;
  const totalPerguntas = vaga.etapas.reduce((acc, e) => acc + e.perguntas.length, 0);

  return (
    <>
      <PageHeader
        title={candidatura.nome}
        description={`${vaga.titulo} · enviada em ${formatDate(candidatura.enviadaEm)}`}
      >
        <Link href="/painel/candidatos" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para candidatos
        </Link>
        <div className="pt-1">
          <CandidaturaStatusBadge status={candidatura.status} />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Dados do candidato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <Mail className="mt-1 size-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">E-mail</dt>
                    <dd className="break-all font-medium">{candidatura.email}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-1 size-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Telefone</dt>
                    <dd className="font-medium">{candidatura.telefone}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-1 size-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Cidade</dt>
                    <dd className="font-medium">{candidatura.cidade}</dd>
                  </div>
                </div>
              </dl>

              <div className="grid gap-3 sm:grid-cols-2">
                <Arquivo label="Currículo" arquivo={candidatura.curriculo} />
                {candidatura.portfolio && <Arquivo label="Portfólio" arquivo={candidatura.portfolio} />}
              </div>
              <p className="text-xs text-muted-foreground">
                Nesta versão os arquivos não são enviados; só o nome e o tamanho ficam registrados.
              </p>

              {candidatura.portfolioLink && (
                <a
                  href={candidatura.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Abrir link do portfólio
                  <ExternalLink className="size-4" aria-hidden="true" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              )}

              {candidatura.adaptacoes && (
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-semibold text-secondary-foreground">Adaptações que ajudam o candidato</p>
                  <p className="mt-1">{candidatura.adaptacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Respostas da avaliação</CardTitle>
              <CardDescription>
                {candidatura.avaliacaoConcluida
                  ? "Avaliação concluída."
                  : "O candidato ainda não concluiu a avaliação."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {totalPerguntas === 0 ? (
                <EmptyState
                  title="Esta vaga não tem avaliação"
                  description="O processo seletivo não possui etapas com perguntas."
                />
              ) : (
                vaga.etapas.map((etapa, i) => (
                  <section key={etapa.id} aria-labelledby={`etapa-${etapa.id}`} className="space-y-3">
                    <h3 id={`etapa-${etapa.id}`} className="font-semibold">
                      Etapa {i + 1}: {etapa.titulo}
                    </h3>
                    <ol className="space-y-3">
                      {etapa.perguntas.map((p, j) => {
                        const resposta = candidatura.respostas[p.id];
                        return (
                          <li key={p.id} className="rounded-lg border p-4">
                            <p className="font-medium">
                              {j + 1}. {p.enunciado}
                            </p>
                            <p className={resposta ? "mt-2 whitespace-pre-line" : "mt-2 italic text-muted-foreground"}>
                              {resposta || "Sem resposta"}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle as="h2">Status no processo</CardTitle>
              <CardDescription>Atualize conforme a análise avança.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStatus} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Novo status</Label>
                  <Select
                    id="status"
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as CandidaturaStatus)}
                  >
                    {STATUS_SELECIONAVEIS.map((s) => (
                      <option key={s} value={s}>
                        {CANDIDATURA_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit" className="w-full" loading={saving} disabled={novoStatus === candidatura.status}>
                  Salvar status
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
