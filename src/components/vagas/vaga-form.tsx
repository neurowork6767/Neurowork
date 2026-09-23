"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, Save } from "lucide-react";

import { FieldError, FormField } from "@/components/forms/form-field";
import { MaskedInput } from "@/components/forms/masked-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADAPTACOES_SUGERIDAS, MODALIDADES } from "@/lib/constants";
import { vagaSchema, type VagaFormValues } from "@/lib/validations/vaga";

type VagaFormProps = {
  defaultValues?: VagaFormValues;
  submitLabel: string;
  onSubmit: (values: VagaFormValues) => Promise<void>;
  onCancel: () => void;
};

const EMPTY_VALUES: VagaFormValues = {
  titulo: "",
  descricao: "",
  requisitos: "",
  modalidade: "presencial",
  local: "",
  faixaSalarial: "",
  adaptacoes: [],
};

/** Formulário de criação e edição de vaga (FE08) */
export function VagaForm({ defaultValues = EMPTY_VALUES, submitLabel, onSubmit, onCancel }: VagaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VagaFormValues>({
    resolver: yupResolver(vagaSchema),
    defaultValues,
    mode: "onTouched",
  });

  const [novaAdaptacao, setNovaAdaptacao] = React.useState("");
  const [extras, setExtras] = React.useState<string[]>(() =>
    defaultValues.adaptacoes.filter((a) => !ADAPTACOES_SUGERIDAS.includes(a))
  );
  const opcoesAdaptacao = [...ADAPTACOES_SUGERIDAS, ...extras];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Informações da vaga</CardTitle>
          <CardDescription>Use frases curtas e diretas. Isso ajuda todos os candidatos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField id="titulo" label="Cargo" error={errors.titulo?.message} required>
            {(field) => <Input {...field} placeholder="Ex.: Assistente Administrativo" {...register("titulo")} />}
          </FormField>

          <FormField
            id="descricao"
            label="Descrição"
            error={errors.descricao?.message}
            hint="O que a pessoa vai fazer no dia a dia."
            required
          >
            {(field) => <Textarea {...field} rows={4} {...register("descricao")} />}
          </FormField>

          <FormField id="requisitos" label="Requisitos" error={errors.requisitos?.message} required>
            {(field) => <Textarea {...field} rows={3} {...register("requisitos")} />}
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="modalidade" label="Modalidade" error={errors.modalidade?.message} required>
              {(field) => (
                <Select {...field} {...register("modalidade")}>
                  {MODALIDADES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField id="local" label="Local" error={errors.local?.message} required>
              {(field) => <Input {...field} placeholder="Ex.: São Paulo – SP ou Remoto" {...register("local")} />}
            </FormField>
          </div>

          <FormField
            id="faixaSalarial"
            label="Salário"
            error={errors.faixaSalarial?.message}
            hint="Informar o salário deixa a vaga mais clara."
          >
            {(field) => (
              <Controller
                control={control}
                name="faixaSalarial"
                render={({ field: { value, onChange, onBlur, name, ref } }) => (
                  <MaskedInput
                    {...field}
                    mask="currency"
                    name={name}
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="R$ 0,00"
                    className="sm:max-w-xs"
                  />
                )}
              />
            )}
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Adaptações oferecidas</CardTitle>
          <CardDescription>O candidato verá estas adaptações antes de se candidatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            control={control}
            name="adaptacoes"
            render={({ field: { value, onChange } }) => (
              <fieldset aria-describedby={errors.adaptacoes ? "adaptacoes-erro" : undefined}>
                <legend className="sr-only">Adaptações oferecidas</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {opcoesAdaptacao.map((opcao, index) => {
                    const id = `adaptacao-${index}`;
                    const checked = value.includes(opcao);
                    return (
                      <label
                        key={opcao}
                        htmlFor={id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-secondary"
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onChange={() => onChange(checked ? value.filter((a) => a !== opcao) : [...value, opcao])}
                        />
                        <span>{opcao}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <label htmlFor="nova-adaptacao" className="text-sm font-medium">
                      Outra adaptação
                    </label>
                    <Input
                      id="nova-adaptacao"
                      value={novaAdaptacao}
                      onChange={(e) => setNovaAdaptacao(e.target.value)}
                      placeholder="Ex.: Intérprete de Libras"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!novaAdaptacao.trim()}
                    onClick={() => {
                      const texto = novaAdaptacao.trim();
                      if (!opcoesAdaptacao.includes(texto)) setExtras((atual) => [...atual, texto]);
                      if (!value.includes(texto)) onChange([...value, texto]);
                      setNovaAdaptacao("");
                    }}
                  >
                    <Plus aria-hidden="true" />
                    Adicionar
                  </Button>
                </div>
              </fieldset>
            )}
          />
          {errors.adaptacoes?.message && <FieldError id="adaptacoes-erro">{errors.adaptacoes.message}</FieldError>}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {!isSubmitting && <Save aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
