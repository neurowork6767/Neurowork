"use client";

import Link from "next/link";
import { Check, CreditCard } from "lucide-react";

import { ErrorState, LoadingState } from "@/components/feedback/states";
import { FormAlert } from "@/components/forms/form-alert";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useService } from "@/hooks/use-service";
import { listarPlanos, obterEmpresaAtual } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";

async function carregar() {
  const [empresa, planos] = await Promise.all([obterEmpresaAtual(), listarPlanos()]);
  return { empresa, planos };
}

/** Meu plano e planos disponíveis (FE14) */
export default function PlanoPage() {
  const { data, error, loading, reload } = useService(carregar);

  if (loading) return <LoadingState variant="cards" label="Carregando planos…" />;
  if (error || !data) return <ErrorState message={error ?? "Não foi possível carregar."} onRetry={reload} />;

  const { empresa, planos } = data;
  const planoAtual = planos.find((p) => p.id === empresa.plano);

  return (
    <>
      <PageHeader title="Plano" description="Consulte sua assinatura e compare os planos." />

      <FormAlert variant="info" className="mb-6">
        <strong>Ambiente de teste.</strong> A contratação é simulada: nenhuma cobrança é feita.
      </FormAlert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" aria-hidden="true" />
            Meu plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          {planoAtual ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-bold text-navy">{planoAtual.nome}</p>
                <p className="text-muted-foreground">
                  {formatCurrency(planoAtual.precoMensal)}/mês ·{" "}
                  {planoAtual.limiteVagas ? `até ${planoAtual.limiteVagas} vagas ativas` : "vagas ilimitadas"}
                </p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">Você ainda não tem um plano. Escolha um abaixo para começar.</p>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Planos disponíveis</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {planos.map((plano) => {
          const atual = plano.id === empresa.plano;
          return (
            <Card key={plano.id} className={plano.destaque ? "flex flex-col border-2 border-primary" : "flex flex-col"}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plano.nome}</CardTitle>
                  {atual ? <Badge variant="success">Seu plano</Badge> : plano.destaque && <Badge>Mais escolhido</Badge>}
                </div>
                <CardDescription>{plano.descricao}</CardDescription>
                <p className="pt-2 text-3xl font-bold">
                  {formatCurrency(plano.precoMensal)}
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plano.recursos.map((r) => (
                    <li key={r} className="flex gap-2">
                      <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {atual ? (
                  <Button className="w-full" variant="outline" disabled>
                    Plano atual
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant={plano.destaque ? "default" : "outline"}>
                    <Link href={`/painel/plano/checkout/${plano.id}`}>Escolher {plano.nome}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
