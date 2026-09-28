"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, ArrowRight, Pencil, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { FileInput } from "@/components/candidatura/file-input";
import { Stepper } from "@/components/candidatura/stepper";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { FieldError, FormField } from "@/components/forms/form-field";
import { FormAlert } from "@/components/forms/form-alert";
import { MaskedInput } from "@/components/forms/masked-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useService } from "@/hooks/use-service";
import { novoProgresso, writeCandidateProgress } from "@/lib/candidate-session";
import { enviarCandidatura, obterVagaPublica } from "@/lib/services";
import { formatFileSize } from "@/lib/utils";
import { CAMPOS_POR_ETAPA, candidaturaSchema, type CandidaturaFormValues } from "@/lib/validations/candidatura";

const ETAPAS = ["Seus dados", "Arquivos", "Revisão"];

function ReviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words sm:col-span-2">
        {value || <span className="text-muted-foreground">Não informado</span>}
      </dd>
    </div>
  );
}

/** Candidatura em etapas, sem conta (FE17) */
export default function CandidaturaPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: vaga, error, loading, reload } = useService(() => obterVagaPublica(slug), [slug]);
  const [etapa, setEtapa] = React.useState(0);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const primeiraRenderizacao = React.useRef(true);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CandidaturaFormValues>({
    resolver: yupResolver(candidaturaSchema),
    mode: "onTouched",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cidade: "",
      portfolioLink: "",
      adaptacoes: "",
      consentimentoLgpd: false,
    },
  });

  // Ao trocar de etapa, o foco vai para o título, para leitores de tela anunciarem a nova etapa
  React.useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [etapa]);

  async function avancar() {
    const valido = await trigger(CAMPOS_POR_ETAPA[etapa]);
    if (valido) setEtapa((e) => e + 1);
    else toast.error("Confira os campos destacados.");
  }

  async function onSubmit(values: CandidaturaFormValues) {
    if (!vaga) return;
    setServerError(null);
    try {
      const candidatura = await enviarCandidatura(vaga.id, {
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        cidade: values.cidade,
        curriculo: { nome: values.curriculo.name, tamanho: values.curriculo.size },
        portfolio: values.portfolio ? { nome: values.portfolio.name, tamanho: values.portfolio.size } : null,
        portfolioLink: values.portfolioLink,
        adaptacoes: values.adaptacoes,
        consentimentoLgpd: values.consentimentoLgpd,
      });

      writeCandidateProgress(slug, novoProgresso(candidatura.id, candidatura.avaliacaoConcluida));

      toast.success("Dados enviados!");
      // Com avaliação, o candidato escolhe antes os ajustes de como quer fazê-la
      router.push(vaga.etapas.length > 0 ? `/vaga/${slug}/ajustes` : `/vaga/${slug}/concluido`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível enviar. Tente novamente.";
      setServerError(message);
      toast.error(message);
    }
  }

  if (loading) return <LoadingState label="Carregando…" />;
  if (error || !vaga)
    return (
      <ErrorState title="Não foi possível abrir a vaga" message={error ?? "Vaga não encontrada."} onRetry={reload} />
    );

  const valores = getValues();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href={`/vaga/${slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a vaga
        </Link>
        <p className="text-muted-foreground">Candidatura para</p>
        <p className="text-xl font-semibold text-navy">{vaga.titulo}</p>
      </div>

      <Stepper steps={ETAPAS} current={etapa} />

      <form
        noValidate
        onSubmit={(e) => {
          // Enter só envia na última etapa; nas outras, avança
          if (etapa < ETAPAS.length - 1) {
            e.preventDefault();
            void avancar();
            return;
          }
          void handleSubmit(onSubmit)(e);
        }}
      >
        <Card>
          <CardHeader>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
              {ETAPAS[etapa]}
            </h1>
            <CardDescription>
              {etapa === 0 && "Usaremos estes dados só para falar com você sobre esta vaga."}
              {etapa === 1 && "Envie seu currículo. O portfólio é opcional."}
              {etapa === 2 && "Confira as informações antes de enviar."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {serverError && <FormAlert>{serverError}</FormAlert>}

            {etapa === 0 && (
              <>
                <FormField id="nome" label="Nome completo" error={errors.nome?.message} required>
                  {(field) => <Input {...field} autoComplete="name" {...register("nome")} />}
                </FormField>
                <FormField id="email" label="E-mail" error={errors.email?.message} required>
                  {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
                </FormField>
                <FormField id="telefone" label="Telefone com DDD" error={errors.telefone?.message} required>
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
                  id="cidade"
                  label="Cidade onde mora"
                  error={errors.cidade?.message}
                  hint="Ex.: Curitiba – PR"
                  required
                >
                  {(field) => <Input {...field} autoComplete="address-level2" {...register("cidade")} />}
                </FormField>
              </>
            )}

            {etapa === 1 && (
              <>
                <FormField id="curriculo" label="Currículo (PDF)" error={errors.curriculo?.message} required>
                  {(field) => (
                    <Controller
                      control={control}
                      name="curriculo"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <FileInput {...field} value={value} onChange={onChange} onBlur={onBlur} />
                      )}
                    />
                  )}
                </FormField>
                <FormField id="portfolio" label="Portfólio (PDF)" error={errors.portfolio?.message}>
                  {(field) => (
                    <Controller
                      control={control}
                      name="portfolio"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <FileInput {...field} value={value} onChange={onChange} onBlur={onBlur} />
                      )}
                    />
                  )}
                </FormField>
                <FormField
                  id="portfolioLink"
                  label="Link do portfólio"
                  error={errors.portfolioLink?.message}
                  hint="GitHub, Behance, site pessoal etc."
                >
                  {(field) => <Input {...field} type="url" placeholder="https://" {...register("portfolioLink")} />}
                </FormField>
                <FormField
                  id="adaptacoes"
                  label="Existe algo que ajude você no processo?"
                  error={errors.adaptacoes?.message}
                  hint="Conte, se quiser, as adaptações que ajudam você (ex.: receber as perguntas por escrito). Não é preciso informar diagnóstico."
                >
                  {(field) => <Textarea {...field} rows={3} {...register("adaptacoes")} />}
                </FormField>
              </>
            )}

            {etapa === 2 && (
              <>
                <section aria-labelledby="revisao-dados">
                  <div className="flex items-center justify-between">
                    <h2 id="revisao-dados" className="font-semibold">
                      Seus dados
                    </h2>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEtapa(0)}>
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                  </div>
                  <dl className="divide-y">
                    <ReviewItem label="Nome" value={valores.nome} />
                    <ReviewItem label="E-mail" value={valores.email} />
                    <ReviewItem label="Telefone" value={valores.telefone} />
                    <ReviewItem label="Cidade" value={valores.cidade} />
                  </dl>
                </section>

                <section aria-labelledby="revisao-arquivos">
                  <div className="flex items-center justify-between">
                    <h2 id="revisao-arquivos" className="font-semibold">
                      Arquivos e informações
                    </h2>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEtapa(1)}>
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                  </div>
                  <dl className="divide-y">
                    <ReviewItem
                      label="Currículo"
                      value={
                        valores.curriculo && `${valores.curriculo.name} (${formatFileSize(valores.curriculo.size)})`
                      }
                    />
                    <ReviewItem label="Portfólio" value={valores.portfolio?.name} />
                    <ReviewItem label="Link do portfólio" value={valores.portfolioLink} />
                    <ReviewItem label="Adaptações" value={valores.adaptacoes} />
                  </dl>
                </section>

                <div className="rounded-lg border bg-secondary/50 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consentimentoLgpd"
                      aria-invalid={Boolean(errors.consentimentoLgpd)}
                      aria-describedby={errors.consentimentoLgpd ? "consentimento-erro" : "consentimento-texto"}
                      {...register("consentimentoLgpd")}
                    />
                    <div className="space-y-1">
                      <label htmlFor="consentimentoLgpd" className="font-medium">
                        Autorizo o uso dos meus dados neste processo seletivo
                      </label>
                      <p id="consentimento-texto" className="flex gap-1 text-sm text-muted-foreground">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <span>
                          Conforme a LGPD, seus dados serão usados só por {vaga.empresaNome} para esta vaga. Você pode
                          pedir a exclusão quando quiser.{" "}
                          <Link
                            href="/privacidade"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary underline"
                          >
                            Ler a política de privacidade (abre em nova aba)
                          </Link>
                        </span>
                      </p>
                    </div>
                  </div>
                  {errors.consentimentoLgpd?.message && (
                    <div className="mt-2">
                      <FieldError id="consentimento-erro">{errors.consentimentoLgpd.message}</FieldError>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {etapa > 0 ? (
            <Button type="button" variant="outline" onClick={() => setEtapa((e) => e - 1)} disabled={isSubmitting}>
              <ArrowLeft aria-hidden="true" />
              Voltar
            </Button>
          ) : (
            <span />
          )}
          {etapa < ETAPAS.length - 1 ? (
            <Button type="submit">
              Continuar
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" loading={isSubmitting}>
              {!isSubmitting && <Send aria-hidden="true" />}
              {isSubmitting ? "Enviando…" : "Enviar candidatura"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
