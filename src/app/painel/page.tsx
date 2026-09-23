"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Plus, Sparkles, Users } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidaturaStatusBadge } from "@/components/vagas/status-badges";
import { useService } from "@/hooks/use-service";
import { listarCandidaturas, obterResumoPainel } from "@/lib/services";
import { formatDate } from "@/lib/utils";

async function carregarPainel() {
  const [resumo, candidaturas] = await Promise.all([obterResumoPainel(), listarCandidaturas()]);
  return { resumo, recentes: candidaturas.slice(0, 5) };
}

/** Página inicial do painel com resumo (FE06) */
export default function PainelPage() {
  const { data, error, loading, reload } = useService(carregarPainel);

  return (
    <>
      <PageHeader
        title="Início"
        description="Resumo dos seus processos seletivos."
        actions={
          <Button asChild>
            <Link href="/painel/vagas/nova">
              <Plus aria-hidden="true" />
              Criar vaga
            </Link>
          </Button>
        }
      />

      {loading && <LoadingState variant="cards" label="Carregando resumo…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-8">
          <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Vagas abertas"
              value={data.resumo.vagasAbertas}
              icon={Briefcase}
              hint={`${data.resumo.totalVagas} no total`}
            />
            <StatCard
              label="Novas candidaturas"
              value={data.resumo.candidaturasNovas}
              icon={Sparkles}
              hint="Aguardando análise"
            />
            <StatCard label="Candidaturas" value={data.resumo.totalCandidaturas} icon={Users} />
            <StatCard label="Avaliações concluídas" value={`${data.resumo.taxaConclusao}%`} icon={CheckCircle2} />
          </section>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle as="h2">Candidaturas recentes</CardTitle>
              {data.recentes.length > 0 && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/painel/candidatos">
                    Ver todas
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {data.recentes.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhuma candidatura ainda"
                  description="Crie uma vaga e compartilhe o link para receber candidaturas."
                  action={
                    <Button asChild>
                      <Link href="/painel/vagas/nova">Criar primeira vaga</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y">
                  {data.recentes.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/painel/candidatos/${c.id}`}
                        className="-mx-2 flex flex-col gap-1 rounded-md px-2 py-3 hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span>
                          <span className="block font-medium">{c.nome}</span>
                          <span className="text-sm text-muted-foreground">
                            {c.vagaTitulo} · {formatDate(c.enviadaEm)}
                          </span>
                        </span>
                        <CandidaturaStatusBadge status={c.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
