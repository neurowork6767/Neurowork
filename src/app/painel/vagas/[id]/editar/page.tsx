"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ErrorState, LoadingState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { VagaForm } from "@/components/vagas/vaga-form";
import { useService } from "@/hooks/use-service";
import { atualizarVaga, obterVaga } from "@/lib/services";
import type { VagaFormValues } from "@/lib/validations/vaga";

/** Editar vaga (FE08) */
export default function EditarVagaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vaga, error, loading, reload } = useService(() => obterVaga(id), [id]);

  async function handleSubmit(values: VagaFormValues) {
    try {
      await atualizarVaga(id, values);
      toast.success("Alterações salvas.");
      router.push(`/painel/vagas/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  if (loading) return <LoadingState label="Carregando vaga…" />;
  if (error || !vaga) return <ErrorState message={error ?? "Vaga não encontrada."} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Editar vaga" description={vaga.titulo}>
        <Link
          href={`/painel/vagas/${id}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a vaga
        </Link>
      </PageHeader>
      <VagaForm
        defaultValues={{
          titulo: vaga.titulo,
          descricao: vaga.descricao,
          requisitos: vaga.requisitos,
          modalidade: vaga.modalidade,
          local: vaga.local,
          faixaSalarial: vaga.faixaSalarial,
          adaptacoes: vaga.adaptacoes,
        }}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/painel/vagas/${id}`)}
      />
    </>
  );
}
