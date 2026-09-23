"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FlaskConical, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ErrorState, SuccessState } from "@/components/feedback/states";
import { FormAlert } from "@/components/forms/form-alert";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { contratarPlanoSimulado, obterPlano } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";

const FORMAS_PAGAMENTO = [
  { value: "pix", label: "Pix" },
  { value: "boleto", label: "Boleto bancário" },
  { value: "cartao", label: "Cartão de crédito" },
];

/**
 * Checkout SIMULADO (FE14). Não coleta dados de cartão nem envia nada a um gateway.
 * A integração real de pagamento fica para a etapa com back-end.
 */
export default function CheckoutPage() {
  const { plano: planoId } = useParams<{ plano: string }>();
  const plano = obterPlano(planoId);
  const [forma, setForma] = React.useState("pix");
  const [loading, setLoading] = React.useState(false);
  const [concluido, setConcluido] = React.useState(false);

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    if (!plano) return;
    setLoading(true);
    try {
      await contratarPlanoSimulado(plano.id);
      setConcluido(true);
      toast.success(`Plano ${plano.nome} ativado (simulação).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  }

  if (!plano) {
    return (
      <ErrorState
        title="Plano não encontrado"
        message="O plano escolhido não existe."
        action={
          <Button asChild>
            <Link href="/painel/plano">Ver planos</Link>
          </Button>
        }
      />
    );
  }

  if (concluido) {
    return (
      <SuccessState
        titleAs="h1"
        title="Contratação simulada concluída"
        description={`O plano ${plano.nome} agora aparece como ativo. Nenhuma cobrança foi feita.`}
        action={
          <Button asChild>
            <Link href="/painel/plano">Ver meu plano</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Confirmar plano" description="Revise antes de confirmar.">
        <Link href="/painel/plano" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para planos
        </Link>
      </PageHeader>

      <FormAlert variant="info" className="mb-6">
        <span className="inline-flex items-center gap-1 font-semibold">
          <FlaskConical className="size-4" aria-hidden="true" />
          Ambiente de teste, sem cobrança.
        </span>{" "}
        Esta tela demonstra o fluxo de contratação. Nenhum dado de pagamento é pedido ou enviado.
      </FormAlert>

      <form onSubmit={handleConfirm} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h2">Forma de pagamento</CardTitle>
            <CardDescription>
              Na versão final, o pagamento será processado por um serviço de pagamento seguro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <fieldset>
              <legend className="sr-only">Forma de pagamento</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {FORMAS_PAGAMENTO.map((f) => (
                  <label
                    key={f.value}
                    htmlFor={`forma-${f.value}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-secondary"
                  >
                    <input
                      type="radio"
                      id={`forma-${f.value}`}
                      name="forma"
                      value={f.value}
                      checked={forma === f.value}
                      onChange={() => setForma(f.value)}
                      className="size-5 accent-primary"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Plano {plano.nome}</span>
              <span className="font-medium">{formatCurrency(plano.precoMensal)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total mensal</span>
              <span>{formatCurrency(plano.precoMensal)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Processando…" : "Confirmar (simulação)"}
            </Button>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Você pode trocar de plano quando quiser.
            </p>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
