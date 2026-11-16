import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardList,
  EyeOff,
  Link2,
  LineChart,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  UserCheck,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANOS } from "@/data/planos";
import { AJUSTES, type AjusteId } from "@/lib/ajustes";
import { cn, formatCurrency } from "@/lib/utils";

const PASSOS = [
  { icon: ClipboardList, title: "Crie a vaga", text: "Descreva a vaga e as adaptações oferecidas." },
  { icon: Timer, title: "Monte o processo", text: "Adicione etapas e perguntas no seu ritmo." },
  { icon: Link2, title: "Compartilhe o link", text: "Envie o link para os candidatos." },
  { icon: LineChart, title: "Acompanhe", text: "Analise respostas e atualize o status." },
];

/** Exemplo de seleção exibido na prévia do hero (mesmos ajustes da tela real do candidato). */
const AJUSTES_EXEMPLO: AjusteId[] = ["uma_por_tela", "pausa", "passo_a_passo"];

const CTA_CADASTRO = "Criar conta";

/** Landing page (FE10) */
export default function HomePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="conteudo">
        {/* Hero: mensagem à esquerda e prévia da tela de ajustes do candidato à direita */}
        <section aria-labelledby="titulo-hero" className="relative overflow-hidden border-b bg-card">
          <div className="brand-gradient absolute inset-x-0 top-0 h-1" data-decorative aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 pb-16 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24">
            <div className="space-y-6">
              <Badge variant="secondary">Recrutamento neuroinclusivo</Badge>
              <h1
                id="titulo-hero"
                className="text-4xl leading-[1.1] font-extrabold tracking-tight text-navy md:text-5xl"
              >
                Processos seletivos acessíveis para pessoas neurodivergentes
              </h1>
              <p className="max-w-[52ch] text-lg text-muted-foreground">
                Crie vagas com avaliações adaptadas. O candidato se inscreve pelo link, sem criar conta e sem pressão
                de tempo.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/cadastro">
                    {CTA_CADASTRO}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#como-funciona">Ver como funciona</Link>
                </Button>
              </div>
            </div>

            <AjustesPreview />
          </div>
        </section>

        {/* Benefícios em grade assimétrica: o diferencial ocupa o bloco maior */}
        <section aria-labelledby="titulo-beneficios" className="mx-auto max-w-6xl px-4 py-20">
          <h2 id="titulo-beneficios" className="max-w-[24ch] text-3xl font-bold tracking-tight text-navy md:text-4xl">
            Por que usar a NeuroWork
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:grid-rows-2">
            <article className="flex flex-col justify-between gap-8 rounded-xl bg-secondary p-7 md:row-span-2 md:p-9">
              <div className="space-y-3">
                <SlidersHorizontal className="size-8 text-primary" aria-hidden="true" />
                <h3 className="text-2xl font-bold tracking-tight text-navy">Avaliação que se adapta a cada pessoa</h3>
                <p className="max-w-[48ch] text-secondary-foreground">
                  As perguntas são as mesmas para todos. O candidato escolhe apenas a forma de ver e de responder.
                </p>
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Ajustes disponíveis para o candidato">
                {AJUSTES.map((ajuste) => (
                  <li
                    key={ajuste.id}
                    className="rounded-full border border-primary/20 bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                  >
                    {ajuste.label}
                  </li>
                ))}
              </ul>
            </article>

            <article className="space-y-3 rounded-xl bg-navy p-7 text-white">
              <UserCheck className="size-7 text-[#90CAF9]" aria-hidden="true" />
              <h3 className="text-xl font-bold tracking-tight text-white">Candidatura sem cadastro</h3>
              <p className="text-white/85">O candidato abre o link da vaga e se inscreve na hora, sem conta nem senha.</p>
            </article>

            <article className="space-y-3 rounded-xl border bg-card p-7">
              <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-bold tracking-tight text-navy">Apoio à Lei de Cotas</h3>
              <p className="text-muted-foreground">
                Processos estruturados e acompanháveis, alinhados à Lei 8.213/91 e à LGPD.
              </p>
            </article>
          </div>
        </section>

        {/* Como funciona: linha do tempo horizontal, sem cartões */}
        <section id="como-funciona" aria-labelledby="titulo-como-funciona" className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 id="titulo-como-funciona" className="text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Como funciona
            </h2>
            <div className="relative mt-12">
              <div
                className="absolute top-5 right-[12%] left-5 hidden h-px bg-border lg:block"
                data-decorative
                aria-hidden="true"
              />
              <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {PASSOS.map(({ icon: Icon, title, text }, index) => (
                  <li key={title} className="relative space-y-3">
                    <span className="relative grid size-10 place-items-center rounded-full bg-primary text-primary-foreground ring-8 ring-card">
                      <Icon className="size-5" aria-hidden="true" />
                      <span className="sr-only">Passo {index + 1}:</span>
                    </span>
                    <h3 className="text-lg font-semibold text-navy">{title}</h3>
                    <p className="max-w-[28ch] text-muted-foreground">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Privacidade: compromisso central do produto, em destaque próprio */}
        <section aria-labelledby="titulo-privacidade" className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-8 rounded-xl border-l-4 border-l-brand-green bg-card p-7 shadow-sm md:grid-cols-[auto_1fr] md:items-start md:p-10">
            <EyeOff className="size-10 text-success" aria-hidden="true" />
            <div className="space-y-3">
              <h2 id="titulo-privacidade" className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
                Ajustes, não diagnósticos
              </h2>
              <p className="max-w-[65ch] text-lg text-muted-foreground">
                A plataforma não solicita nem registra diagnósticos. Quando o candidato usa um atalho por condição,
                ele só serve para sugerir ajustes e não é salvo nem enviado à empresa.
              </p>
              <Link
                href="/privacidade"
                className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
              >
                Ler a política de privacidade
              </Link>
            </div>
          </div>
        </section>

        <section id="planos" aria-labelledby="titulo-planos" className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 id="titulo-planos" className="text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Planos
            </h2>
            <p className="mt-2 text-muted-foreground">Assinatura mensal, sem fidelidade.</p>

            <div className="mt-10 grid gap-5 md:grid-cols-3 md:items-stretch">
              {PLANOS.map((plano) => (
                <article
                  key={plano.id}
                  aria-labelledby={`plano-${plano.id}`}
                  className={cn(
                    "flex flex-col rounded-xl border bg-background p-7",
                    plano.destaque && "border-2 border-primary bg-card shadow-md shadow-primary/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 id={`plano-${plano.id}`} className="text-xl font-bold text-navy">
                      {plano.nome}
                    </h3>
                    {plano.destaque && <Badge>Mais escolhido</Badge>}
                  </div>
                  <p className="mt-2 min-h-12 text-sm text-muted-foreground">{plano.descricao}</p>
                  <p className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-foreground">
                    {formatCurrency(plano.precoMensal)}
                    <span className="font-sans text-base font-normal text-muted-foreground">/mês</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 border-t pt-6">
                    {plano.recursos.map((recurso) => (
                      <li key={recurso} className="flex gap-2">
                        <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                        {recurso}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-8 w-full" variant={plano.destaque ? "default" : "outline"}>
                    <Link href="/cadastro">
                      {CTA_CADASTRO}
                      <span className="sr-only"> no plano {plano.nome}</span>
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-white/80 sm:grid-cols-2 sm:items-end">
          <div className="space-y-2">
            <Logo tone="inverse" size="sm" />
            <p>Trabalho de Conclusão de Curso, turma DS302.</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p>A plataforma não solicita nem registra diagnósticos.</p>
            <Link href="/privacidade" className="font-medium text-white underline underline-offset-4">
              Política de privacidade
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

/**
 * Prévia estática da tela "Como você prefere fazer a avaliação?" (/vaga/[slug]/ajustes).
 * Usa a mesma lista de AJUSTES do sistema; é decorativa e some no modo simplificado.
 */
function AjustesPreview() {
  return (
    <div
      className="rounded-xl border bg-background p-5 shadow-lg shadow-navy/10 sm:p-7"
      data-decorative
      aria-hidden="true"
    >
      <p className="text-sm font-semibold text-muted-foreground">Visão do candidato</p>
      <p className="mt-1 font-heading text-xl font-bold tracking-tight text-navy">
        Como você prefere fazer a avaliação?
      </p>
      <ul className="mt-5 space-y-2">
        {AJUSTES.slice(0, 5).map((ajuste) => {
          const ativo = AJUSTES_EXEMPLO.includes(ajuste.id);
          return (
            <li
              key={ajuste.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card px-4 py-3",
                ativo && "border-primary/40 bg-secondary"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-input bg-card",
                  ativo && "border-primary bg-primary text-primary-foreground"
                )}
              >
                {ativo && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{ajuste.label}</span>
                <span className="block text-xs text-muted-foreground">{ajuste.descricao}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex justify-end">
        <span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Começar a avaliação
          <ArrowRight className="size-4" />
        </span>
      </div>
    </div>
  );
}
