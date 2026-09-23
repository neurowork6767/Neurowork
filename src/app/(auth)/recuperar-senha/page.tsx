"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { recuperarSenha } from "@/lib/services";
import { recuperarSenhaSchema, type RecuperarSenhaValues } from "@/lib/validations/auth";

/** Recuperação de senha (FE05) */
export default function RecuperarSenhaPage() {
  const [enviadoPara, setEnviadoPara] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaValues>({
    resolver: yupResolver(recuperarSenhaSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RecuperarSenhaValues) {
    try {
      await recuperarSenha(values.email);
      setEnviadoPara(values.email);
      toast.success("Pedido recebido.");
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold text-navy">Recuperar senha</h1>
        <CardDescription>Enviaremos um link para você criar uma nova senha.</CardDescription>
      </CardHeader>

      {enviadoPara ? (
        <CardContent className="space-y-4 text-center" role="status">
          <MailCheck className="mx-auto size-12 text-success" aria-hidden="true" />
          <p className="text-lg font-semibold">Confira seu e-mail</p>
          <p className="text-muted-foreground">
            Se existir uma conta com <strong className="text-foreground">{enviadoPara}</strong>, você vai receber as
            instruções em alguns minutos. Olhe também a caixa de spam.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft aria-hidden="true" />
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent>
            <FormField id="email" label="E-mail da conta" error={errors.email?.message} required>
              {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
            </FormField>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Enviar link
            </Button>
            <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Voltar para o login
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
