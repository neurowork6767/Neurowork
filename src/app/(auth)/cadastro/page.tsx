"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";

import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { MaskedInput } from "@/components/forms/masked-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cadastrarEmpresa } from "@/lib/services";
import { cadastroSchema, type CadastroValues } from "@/lib/validations/auth";

/** Cadastro da empresa (FE05) */
export default function CadastroPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroValues>({
    resolver: yupResolver(cadastroSchema),
    mode: "onTouched",
    defaultValues: { nome: "", cnpj: "", responsavel: "", email: "", telefone: "", senha: "", confirmarSenha: "" },
  });

  async function onSubmit(values: CadastroValues) {
    setServerError(null);
    try {
      await cadastrarEmpresa({
        nome: values.nome,
        cnpj: values.cnpj,
        responsavel: values.responsavel,
        email: values.email,
        telefone: values.telefone,
        senha: values.senha,
      });
      toast.success("Conta criada com sucesso! Agora crie sua primeira vaga.");
      router.push("/painel");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível criar a conta.";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold text-navy">Cadastre sua empresa</h1>
        <CardDescription>Leva menos de 2 minutos. Campos com * são obrigatórios.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5">
          {serverError && <FormAlert>{serverError}</FormAlert>}

          <fieldset className="space-y-5">
            <legend className="mb-3 font-semibold">Dados da empresa</legend>

            <FormField id="nome" label="Nome da empresa" error={errors.nome?.message} required>
              {(field) => <Input {...field} autoComplete="organization" {...register("nome")} />}
            </FormField>

            <FormField
              id="cnpj"
              label="CNPJ"
              error={errors.cnpj?.message}
              hint="Somente números; a formatação é automática."
              required
            >
              {(field) => (
                <Controller
                  control={control}
                  name="cnpj"
                  render={({ field: { value, onChange, onBlur, name, ref } }) => (
                    <MaskedInput
                      {...field}
                      mask="cnpj"
                      name={name}
                      ref={ref}
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder="00.000.000/0000-00"
                    />
                  )}
                />
              )}
            </FormField>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-3 font-semibold">Pessoa responsável</legend>

            <FormField id="responsavel" label="Nome completo" error={errors.responsavel?.message} required>
              {(field) => <Input {...field} autoComplete="name" {...register("responsavel")} />}
            </FormField>

            <FormField id="email" label="E-mail corporativo" error={errors.email?.message} required>
              {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
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
                      placeholder="(00) 00000-0000"
                    />
                  )}
                />
              )}
            </FormField>

            <FormField
              id="senha"
              label="Senha"
              error={errors.senha?.message}
              hint="Pelo menos 8 caracteres, com letras e números."
              required
            >
              {(field) => <Input {...field} type="password" autoComplete="new-password" {...register("senha")} />}
            </FormField>

            <FormField id="confirmarSenha" label="Repita a senha" error={errors.confirmarSenha?.message} required>
              {(field) => (
                <Input {...field} type="password" autoComplete="new-password" {...register("confirmarSenha")} />
              )}
            </FormField>
          </fieldset>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Criando conta…" : "Criar conta"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
