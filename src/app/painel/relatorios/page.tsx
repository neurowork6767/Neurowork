"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, Users } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { useService } from "@/hooks/use-service";
import { gerarRelatorioVaga, listarVagas } from "@/lib/services";

function Relatorio({ vagaId }: { vagaId: string }) {
  const { data, error, loading, reload } = useService(() => gerarRelatorioVaga(vagaId), [vagaId]);

  if (loading) return <LoadingState variant="cards" label="Gerando relatório…" />;
  if (error || !data) return <ErrorState message={error ?? "Não foi possível gerar o relatório."} onRetry={reload} />;

  if (data.totalCandidatos === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sem candidaturas nesta vaga"
        description="O relatório aparece quando a vaga receber candidaturas."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de candidatos" value={data.totalCandidatos} icon={Users} />
        <StatCard label="Avaliações concluídas" value={data.avaliacoesConcluidas} icon={CheckCircle2} tone="green" />
        <StatCard label="Taxa de conclusão" value={`${data.taxaConclusao}%`} icon={BarChart3} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Candidatos por status</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabela acessível: os dados não dependem apenas do gráfico */}
          <table className="w-full text-left">
            <caption className="sr-only">Quantidade de candidatos por status em {data.vagaTitulo}</caption>
            <thead className="border-b text-sm">
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Status
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Quantidade
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  %
                </th>
                <th scope="col" className="hidden w-1/3 py-2 font-semibold sm:table-cell">
                  <span className="sr-only">Gráfico</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.porStatus.map((item) => {
                const percentual = Math.round((item.quantidade / data.totalCandidatos) * 100);
                return (
                  <tr key={item.status}>
                    <th scope="row" className="py-3 pr-4 font-medium">
                      {item.label}
                    </th>
                    <td className="py-3 pr-4 text-right">{item.quantidade}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{percentual}%</td>
                    <td className="hidden py-3 sm:table-cell" aria-hidden="true">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${percentual}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Conclusão da avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            {`${data.avaliacoesConcluidas} de ${data.totalCandidatos} candidatos concluíram a avaliação (${data.taxaConclusao}%).`}
          </p>
          <Progress value={data.taxaConclusao} label="Taxa de conclusão da avaliação" />
        </CardContent>
      </Card>
    </div>
  );
}

/** Relatório por vaga (FE15) */
export default function RelatoriosPage() {
  const { data: vagas, error, loading, reload } = useService(listarVagas);
  const [vagaId, setVagaId] = React.useState("");

  React.useEffect(() => {
    if (vagas && vagas.length > 0 && !vagaId) setVagaId(vagas[0].id);
  }, [vagas, vagaId]);

  return (
    <>
      <PageHeader title="Relatórios" description="Acompanhe os resultados de cada vaga." />

      {loading && <LoadingState label="Carregando vagas…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {vagas && vagas.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="Nenhuma vaga para analisar"
          description="Crie uma vaga para ver os relatórios."
          action={
            <Button asChild>
              <Link href="/painel/vagas/nova">Criar vaga</Link>
            </Button>
          }
        />
      )}

      {vagas && vagas.length > 0 && (
        <div className="space-y-6">
          <div className="max-w-sm space-y-2">
            <Label htmlFor="relatorio-vaga">Vaga</Label>
            <Select id="relatorio-vaga" value={vagaId} onChange={(e) => setVagaId(e.target.value)}>
              {vagas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.titulo}
                </option>
              ))}
            </Select>
          </div>
          {vagaId && <Relatorio vagaId={vagaId} />}
        </div>
      )}
    </>
  );
}
