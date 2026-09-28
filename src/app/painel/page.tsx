"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Circle, Plus, Sparkles, Users } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { StatCard } from "@/components/layout/stat-card";
import { WelcomeBanner } from "@/components/layout/welcome-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidaturaStatusBadge } from "@/components/vagas/status-badges";
import { useService } from "@/hooks/use-service";
import { listarCandidaturas, listarVagas, obterEmpresaAtual, obterResumoPainel } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";

async function carregarPainel() {
  const [empresa, resumo, candidaturas, vagas] = await Promise.all([
    obterEmpresaAtual(),
    obterResumoPainel(),
    listarCandidaturas(),
    listarVagas(),
  ]);
  return {
    empresa,
    resumo,
    recentes: candidaturas.slice(0, 5),
    primeirosPassos: [
      { label: "Criar a primeira vaga", feito: vagas.length > 0, href: "/painel/vagas/nova" },
      {
        label: "Montar o processo seletivo",
        feito: vagas.some((v) => v.etapas.length > 0),
        href: vagas[0] ? `/painel/vagas/${vagas[0].id}/processo` : "/painel/vagas",
      },
      { label: "Receber a primeira candidatura", feito: candidaturas.length > 0, href: "/painel/vagas" },
      { label: "Escolher um plano", feito: empresa.plano !== null, href: "/painel/plano" },
    ],
  };
}

/** Página inicial do painel com resumo (FE06) */
export default function PainelPage() {
  const { data, error, loading, reload } = useService(carregarPainel);

  if (loading) return <LoadingState variant="cards" label="Carregando resumo…" />;
  if (error || !data) return <ErrorState message={error ?? "Não foi possível carregar."} onRetry={reload} />;

  const primeiroNome = data.empresa.responsavel.split(" ")[0];
  const passosPendentes = data.primeirosPassos.filter((p) => !p.feito).length;

  return (
    <>
      <WelcomeBanner
        title={`Olá, ${primeiroNome}!`}
        description={`Este é o resumo dos processos seletivos da ${data.empresa.nome}.`}
        actions={
          <>
            <Button asChild className="bg-white text-navy hover:bg-white/90">
              <Link href="/painel/vagas/nova">
                <Plus aria-hidden="true" />
                Criar vaga
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/painel/candidatos">Ver candidatos</Link>
            </Button>
          </>
        }
      />

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
            tone="green"
          />
          <StatCard label="Candidaturas" value={data.resumo.totalCandidaturas} icon={Users} />
          <StatCard
            label="Avaliações concluídas"
            value={`${data.resumo.taxaConclusao}%`}
            icon={CheckCircle2}
            tone="green"
          />
        </section>

        {passosPendentes > 0 && (
          <Card>
            <CardHeader>
              <CardTitle as="h2">Primeiros passos</CardTitle>
              <CardDescription>
                Faltam {passosPendentes} {passosPendentes === 1 ? "passo" : "passos"} para seu processo seletivo ficar
                completo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-3 sm:grid-cols-2">
                {data.primeirosPassos.map((passo) => (
                  <li key={passo.label}>
                    <Link
                      href={passo.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent",
                        passo.feito && "border-success/30 bg-success/5"
                      )}
                    >
                      {passo.feito ? (
                        <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
                      ) : (
                        <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className={passo.feito ? "text-muted-foreground line-through" : "font-medium"}>
                        {passo.label}
                      </span>
                      <span className="sr-only">{passo.feito ? "(concluído)" : "(pendente)"}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

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
                      <span className="flex items-center gap-3">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-heading text-sm font-bold text-secondary-foreground"
                          aria-hidden="true"
                        >
                          {c.nome.charAt(0)}
                        </span>
                        <span>
                          <span className="block font-medium">{c.nome}</span>
                          <span className="text-sm text-muted-foreground">
                            {c.vagaTitulo} · {formatDate(c.enviadaEm)}
                          </span>
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
    </>
  );
}
