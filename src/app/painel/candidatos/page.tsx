"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, Users } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CandidaturaStatusBadge } from "@/components/vagas/status-badges";
import { useService } from "@/hooks/use-service";
import { CANDIDATURA_STATUS_LABEL } from "@/lib/constants";
import { listarCandidaturas, listarVagas } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import type { CandidaturaStatus } from "@/types";

async function carregar() {
  const [candidaturas, vagas] = await Promise.all([listarCandidaturas(), listarVagas()]);
  return { candidaturas, vagas };
}

type StatusFiltro = CandidaturaStatus | "todos";

/** Candidatos por vaga, com filtro por status (FE12) */
export default function CandidatosPage() {
  const { data, error, loading, reload } = useService(carregar);
  const [vagaId, setVagaId] = React.useState("todas");
  const [status, setStatus] = React.useState<StatusFiltro>("todos");

  // Permite abrir a lista já filtrada a partir da página da vaga (?vaga=id)
  React.useEffect(() => {
    const vagaParam = new URLSearchParams(window.location.search).get("vaga");
    if (vagaParam) setVagaId(vagaParam);
  }, []);

  const filtradas = React.useMemo(
    () =>
      (data?.candidaturas ?? []).filter(
        (c) => (vagaId === "todas" || c.vagaId === vagaId) && (status === "todos" || c.status === status)
      ),
    [data, vagaId, status]
  );

  const temFiltro = vagaId !== "todas" || status !== "todos";

  return (
    <>
      <PageHeader title="Candidatos" description="Acompanhe quem se candidatou às suas vagas." />

      {loading && <LoadingState variant="list" label="Carregando candidatos…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.candidaturas.length === 0 && (
        <EmptyState
          icon={Users}
          title="Nenhum candidato ainda"
          description="Quando alguém se candidatar pelo link de uma vaga, a candidatura aparece aqui."
          action={
            <Button asChild>
              <Link href="/painel/vagas">Ver minhas vagas</Link>
            </Button>
          }
        />
      )}

      {data && data.candidaturas.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="filtro-vaga">Vaga</Label>
              <Select id="filtro-vaga" value={vagaId} onChange={(e) => setVagaId(e.target.value)}>
                <option value="todas">Todas as vagas</option>
                {data.vagas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.titulo}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtro-status">Status</Label>
              <Select id="filtro-status" value={status} onChange={(e) => setStatus(e.target.value as StatusFiltro)}>
                <option value="todos">Todos os status</option>
                {(Object.keys(CANDIDATURA_STATUS_LABEL) as CandidaturaStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {CANDIDATURA_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtradas.length} {filtradas.length === 1 ? "candidatura" : "candidaturas"}
          </p>

          {filtradas.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="Nenhum candidato com esses filtros"
              action={
                temFiltro && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVagaId("todas");
                      setStatus("todos");
                    }}
                  >
                    Limpar filtros
                  </Button>
                )
              }
            />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <caption className="sr-only">Lista de candidaturas</caption>
                <thead className="border-b bg-muted/50 text-sm">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Nome
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Vaga
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Data
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Avaliação
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtradas.map((c) => (
                    <tr key={c.id} className="hover:bg-accent/50">
                      <td className="px-4 py-3">
                        <Link href={`/painel/candidatos/${c.id}`} className="font-medium text-primary hover:underline">
                          {c.nome}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.vagaTitulo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(c.enviadaEm)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.avaliacaoConcluida ? "Concluída" : "Pendente"}
                      </td>
                      <td className="px-4 py-3">
                        <CandidaturaStatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
