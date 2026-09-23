"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ListChecks, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { FormAlert } from "@/components/forms/form-alert";
import { PageHeader } from "@/components/layout/page-header";
import { EtapaEditor } from "@/components/processo/etapa-editor";
import { QuestionField } from "@/components/processo/question-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useService } from "@/hooks/use-service";
import { obterVaga, salvarEtapas } from "@/lib/services";
import { createId, moveItem } from "@/lib/utils";
import { validarProcesso } from "@/lib/validations/processo";
import type { Etapa } from "@/types";

/** Montagem do processo seletivo em etapas, com pré-visualização (FE11) */
export default function ProcessoSeletivoPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vaga, error, loading, reload } = useService(() => obterVaga(id), [id]);

  const [etapas, setEtapas] = React.useState<Etapa[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [respostasPreview, setRespostasPreview] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (vaga) setEtapas(vaga.etapas);
  }, [vaga]);

  function update(next: Etapa[]) {
    setEtapas(next);
    setDirty(true);
    // Depois da primeira tentativa de salvar, os erros são atualizados enquanto o usuário corrige
    if (Object.keys(errors).length > 0) validarProcesso(next).then(setErrors);
  }

  function addEtapa() {
    update([...etapas, { id: createId("etp"), titulo: "", instrucoes: "", perguntas: [] }]);
  }

  async function handleSave() {
    const found = await validarProcesso(etapas);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Revise os campos destacados antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      await salvarEtapas(id, etapas);
      setDirty(false);
      toast.success("Processo seletivo salvo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Carregando processo seletivo…" />;
  if (error || !vaga) return <ErrorState message={error ?? "Vaga não encontrada."} onRetry={reload} />;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <PageHeader
        title="Processo seletivo"
        description={vaga.titulo}
        actions={
          <>
            <Button variant="outline" onClick={() => setPreview((v) => !v)} aria-pressed={preview}>
              {preview ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {preview ? "Voltar à edição" : "Ver como o candidato"}
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={preview}>
              {!saving && <Save aria-hidden="true" />}
              Salvar
            </Button>
          </>
        }
      >
        <Link
          href={`/painel/vagas/${id}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a vaga
        </Link>
      </PageHeader>

      {dirty && !preview && (
        <FormAlert variant="info" className="mb-4">
          Existem alterações não salvas.
        </FormAlert>
      )}
      {hasErrors && !preview && (
        <FormAlert className="mb-4">Alguns campos precisam de atenção. Eles estão marcados em vermelho.</FormAlert>
      )}

      {preview ? (
        <div className="space-y-6">
          <FormAlert variant="info">
            Pré-visualização: é assim que o candidato verá a avaliação. As respostas aqui não são salvas.
          </FormAlert>
          {etapas.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nenhuma etapa para mostrar"
              description="Adicione etapas para ver a pré-visualização."
            />
          ) : (
            etapas.map((etapa, i) => (
              <Card key={etapa.id}>
                <CardHeader>
                  <p className="text-sm font-medium text-muted-foreground">
                    Etapa {i + 1} de {etapas.length}
                  </p>
                  <CardTitle as="h2">{etapa.titulo || "Etapa sem título"}</CardTitle>
                  {etapa.instrucoes && <CardDescription className="text-base">{etapa.instrucoes}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-8">
                  {etapa.perguntas.map((pergunta, j) => (
                    <QuestionField
                      key={pergunta.id}
                      pergunta={pergunta}
                      numero={j + 1}
                      value={respostasPreview[pergunta.id] ?? ""}
                      onChange={(value) => setRespostasPreview((r) => ({ ...r, [pergunta.id]: value }))}
                    />
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {etapas.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nenhuma etapa ainda"
              description="Divida a avaliação em etapas curtas. Isso ajuda o candidato a manter o foco."
              action={
                <Button onClick={addEtapa}>
                  <Plus aria-hidden="true" />
                  Adicionar primeira etapa
                </Button>
              }
            />
          ) : (
            <>
              {etapas.map((etapa, i) => (
                <EtapaEditor
                  key={etapa.id}
                  etapa={etapa}
                  index={i}
                  total={etapas.length}
                  errors={errors}
                  onChange={(nova) => update(etapas.map((e, idx) => (idx === i ? nova : e)))}
                  onRemove={() => update(etapas.filter((_, idx) => idx !== i))}
                  onMove={(direction) => update(moveItem(etapas, i, direction))}
                />
              ))}
              <Button variant="outline" onClick={addEtapa} className="w-full border-dashed">
                <Plus aria-hidden="true" />
                Adicionar etapa
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
