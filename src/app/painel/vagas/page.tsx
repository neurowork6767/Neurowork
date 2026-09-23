"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, MapPin, Plus, Search, Users } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VagaStatusBadge } from "@/components/vagas/status-badges";
import { useService } from "@/hooks/use-service";
import { MODALIDADE_LABEL } from "@/lib/constants";
import { listarVagas } from "@/lib/services";
import { formatDate } from "@/lib/utils";

/** Lista de vagas da empresa (FE07) */
export default function VagasPage() {
  const { data: vagas, error, loading, reload } = useService(listarVagas);
  const [busca, setBusca] = React.useState("");

  const filtradas = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (vagas ?? []).filter((v) => v.titulo.toLowerCase().includes(termo));
  }, [vagas, busca]);

  const novaVagaButton = (
    <Button asChild>
      <Link href="/painel/vagas/nova">
        <Plus aria-hidden="true" />
        Criar vaga
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader title="Vagas" description="Crie, edite e acompanhe suas vagas." actions={novaVagaButton} />

      {loading && <LoadingState variant="list" label="Carregando vagas…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {vagas && vagas.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="Você ainda não tem vagas"
          description="Crie sua primeira vaga para gerar o link de candidatura."
          action={novaVagaButton}
        />
      )}

      {vagas && vagas.length > 0 && (
        <div className="space-y-4">
          <div className="max-w-sm space-y-2">
            <Label htmlFor="busca-vaga">Buscar por título</Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="busca-vaga"
                type="search"
                className="pl-9"
                placeholder="Ex.: Desenvolvedor"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtradas.length} {filtradas.length === 1 ? "vaga encontrada" : "vagas encontradas"}
          </p>

          {filtradas.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhuma vaga encontrada"
              description={`Não há vagas com “${busca}” no título.`}
              action={
                <Button variant="outline" onClick={() => setBusca("")}>
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {filtradas.map((vaga) => (
                <li key={vaga.id}>
                  <Card className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold leading-tight">
                        <Link href={`/painel/vagas/${vaga.id}`} className="hover:underline">
                          {vaga.titulo}
                        </Link>
                      </h2>
                      <VagaStatusBadge status={vaga.status} />
                    </div>
                    <dl className="grid gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <dt>
                          <MapPin className="size-4" aria-hidden="true" />
                          <span className="sr-only">Local</span>
                        </dt>
                        <dd>
                          {MODALIDADE_LABEL[vaga.modalidade]} · {vaga.local}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt>
                          <Users className="size-4" aria-hidden="true" />
                          <span className="sr-only">Candidaturas</span>
                        </dt>
                        <dd>
                          {vaga.totalCandidaturas} {vaga.totalCandidaturas === 1 ? "candidatura" : "candidaturas"}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-xs text-muted-foreground">Criada em {formatDate(vaga.criadaEm)}</p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={`/painel/vagas/${vaga.id}`}>Abrir</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/painel/vagas/${vaga.id}/editar`}>Editar</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/painel/vagas/${vaga.id}/processo`}>Processo seletivo</Link>
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
