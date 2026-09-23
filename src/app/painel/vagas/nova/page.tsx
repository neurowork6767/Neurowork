"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { SuccessState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { JobLinkCard } from "@/components/vagas/job-link-card";
import { VagaForm } from "@/components/vagas/vaga-form";
import { criarVaga } from "@/lib/services";
import type { Vaga } from "@/types";
import type { VagaFormValues } from "@/lib/validations/vaga";

/** Criar vaga (FE08) e exibir o link logo após salvar (FE09) */
export default function NovaVagaPage() {
  const router = useRouter();
  const [vagaCriada, setVagaCriada] = React.useState<Vaga | null>(null);

  async function handleSubmit(values: VagaFormValues) {
    try {
      const vaga = await criarVaga(values);
      setVagaCriada(vaga);
      toast.success("Vaga criada com sucesso!");
      window.scrollTo({ top: 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a vaga.");
    }
  }

  if (vagaCriada) {
    return (
      <div className="space-y-6">
        <SuccessState
          titleAs="h1"
          title="Vaga criada!"
          description={
            <>
              <strong className="text-foreground">{vagaCriada.titulo}</strong> já está aberta. Agora monte as etapas do
              processo seletivo ou copie o link abaixo.
            </>
          }
          action={
            <>
              <Button asChild>
                <Link href={`/painel/vagas/${vagaCriada.id}/processo`}>
                  <ListChecks aria-hidden="true" />
                  Montar processo seletivo
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/painel/vagas/${vagaCriada.id}`}>Ver vaga</Link>
              </Button>
            </>
          }
        />
        <JobLinkCard slug={vagaCriada.slug} />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Criar vaga" description="Preencha as informações. Você pode editar depois.">
        <Link href="/painel/vagas" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para vagas
        </Link>
      </PageHeader>
      <VagaForm submitLabel="Salvar vaga" onSubmit={handleSubmit} onCancel={() => router.push("/painel/vagas")} />
    </>
  );
}
