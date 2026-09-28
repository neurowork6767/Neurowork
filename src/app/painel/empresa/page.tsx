"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Building2, DatabaseBackup, Download, Lock, Save } from "lucide-react";
import { toast } from "sonner";

import { ErrorState, LoadingState } from "@/components/feedback/states";
import { FormField } from "@/components/forms/form-field";
import { MaskedInput } from "@/components/forms/masked-input";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useService } from "@/hooks/use-service";
import { atualizarEmpresa, exportarDados, obterEmpresaAtual, obterPlano } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import { empresaSchema, type EmpresaFormValues } from "@/lib/validations/empresa";
import type { Empresa } from "@/types";

function EmpresaForm({ empresa, onSaved }: { empresa: Empresa; onSaved: (empresa: Empresa) => void }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EmpresaFormValues>({
    resolver: yupResolver(empresaSchema),
    mode: "onTouched",
    defaultValues: { nome: empresa.nome, responsavel: empresa.responsavel, telefone: empresa.telefone },
  });

  async function onSubmit(values: EmpresaFormValues) {
    try {
      const atualizada = await atualizarEmpresa(values);
      reset(values);
      onSaved(atualizada);
      toast.success("Dados da empresa atualizados.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle as="h2">Dados da empresa</CardTitle>
          <CardDescription>Essas informações aparecem para os candidatos na página da vaga.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField id="nome" label="Nome da empresa" error={errors.nome?.message} required>
            {(field) => <Input {...field} autoComplete="organization" {...register("nome")} />}
          </FormField>
          <FormField id="responsavel" label="Pessoa responsável" error={errors.responsavel?.message} required>
            {(field) => <Input {...field} autoComplete="name" {...register("responsavel")} />}
          </FormField>
          <FormField id="telefone" label="Telefone" error={errors.telefone?.message} required>
            {(field) => (
              <Controller
                control={control}
                name="telefone"
                render={({ field: { value, onChange, onBlur, name, ref } }) => (
                  <MaskedInput
                    {...field}
                    mask="phone"
                    type="tel"
                    autoComplete="tel"
                    name={name}
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="sm:max-w-xs"
                  />
                )}
              />
            )}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="cnpj" className="flex items-center gap-1.5 text-sm font-medium">
                CNPJ <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </label>
              <Input id="cnpj" value={empresa.cnpj} readOnly aria-describedby="bloqueados-dica" className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email-conta" className="flex items-center gap-1.5 text-sm font-medium">
                E-mail da conta <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </label>
              <Input
                id="email-conta"
                value={empresa.email}
                readOnly
                aria-describedby="bloqueados-dica"
                className="bg-muted"
              />
            </div>
          </div>
          <p id="bloqueados-dica" className="text-sm text-muted-foreground">
            CNPJ e e-mail não podem ser alterados por aqui. Para trocar, fale com o suporte.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            {!isSubmitting && <Save aria-hidden="true" />}
            Salvar alterações
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

/** Backup dos dados da empresa em JSON (RNF-08). */
function BackupCard() {
  const [baixando, setBaixando] = React.useState(false);

  async function baixar() {
    setBaixando(true);
    try {
      const backup = await exportarDados();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `neurowork-backup-${backup.geradoEm.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Backup baixado: ${backup.vagas.length} vagas e ${backup.candidaturas.length} candidaturas.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível gerar o backup.");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2">
          <DatabaseBackup className="size-5 text-brand-blue" aria-hidden="true" />
          Backup dos dados
        </CardTitle>
        <CardDescription>
          Baixe uma cópia de todas as suas vagas e candidaturas. Recomendamos fazer isso toda semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" onClick={baixar} loading={baixando}>
          {!baixando && <Download aria-hidden="true" />}
          Baixar backup (JSON)
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          O arquivo contém dados pessoais dos candidatos. Guarde em local seguro.
        </p>
      </CardContent>
    </Card>
  );
}

/** Dados da conta da empresa (complemento ao FE05/FE06) */
export default function EmpresaPage() {
  const { data: empresa, error, loading, reload, setData } = useService(obterEmpresaAtual);

  if (loading) return <LoadingState label="Carregando dados da empresa…" />;
  if (error || !empresa) return <ErrorState message={error ?? "Não foi possível carregar."} onRetry={reload} />;

  const plano = empresa.plano ? obterPlano(empresa.plano) : undefined;

  return (
    <>
      <PageHeader title="Minha empresa" description="Consulte e atualize os dados da sua conta." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EmpresaForm empresa={empresa} onSaved={(atualizada) => setData(() => atualizada)} />
        </div>
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2">
                <Building2 className="size-5 text-brand-blue" aria-hidden="true" />
                Sua conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Plano</dt>
                  <dd className="flex items-center gap-2">
                    {plano ? <Badge variant="success">{plano.nome}</Badge> : <span>Nenhum plano ativo</span>}
                    <Link href="/painel/plano" className="text-sm font-medium text-primary hover:underline">
                      {plano ? "Ver plano" : "Escolher plano"}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Cliente desde</dt>
                  <dd>{formatDate(empresa.criadaEm)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <BackupCard />
        </div>
      </div>
    </>
  );
}
