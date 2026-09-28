"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEMO_LOGIN } from "@/data/seed";
import { login, modoDemonstracao } from "@/lib/services";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

/** Login da empresa (FE05) */
export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const sessao = await login(values.email, values.senha);
      toast.success(`Bem-vindo(a), ${sessao.nome}!`);
      router.push("/painel");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível entrar.";
      setServerError(message);
      toast.error(message);
    }
  }

  function fillDemo() {
    setValue("email", DEMO_LOGIN.email, { shouldValidate: true });
    setValue("senha", DEMO_LOGIN.senha, { shouldValidate: true });
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold text-navy">Entrar</h1>
        <CardDescription>Acesse o painel da sua empresa.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5">
          {modoDemonstracao && (
            <FormAlert variant="info">
              <p className="font-medium">Conta de demonstração</p>
              <p>
                E-mail: {DEMO_LOGIN.email} · Senha: {DEMO_LOGIN.senha}
              </p>
              <Button type="button" variant="link" className="h-auto p-0" onClick={fillDemo}>
                Preencher com os dados de exemplo
              </Button>
            </FormAlert>
          )}

          {serverError && <FormAlert>{serverError}</FormAlert>}

          <FormField id="email" label="E-mail" error={errors.email?.message} required>
            {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
          </FormField>

          <FormField id="senha" label="Senha" error={errors.senha?.message} required>
            {(field) => <Input {...field} type="password" autoComplete="current-password" {...register("senha")} />}
          </FormField>

          <div className="text-right">
            <Link
              href="/recuperar-senha"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {!isSubmitting && <LogIn aria-hidden="true" />}
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-primary underline-offset-4 hover:underline">
              Cadastre sua empresa
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
