import Link from "next/link";
import { ArrowRight, Check, ClipboardList, Link2, LineChart, ShieldCheck, Timer, UserCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANOS } from "@/data/planos";
import { formatCurrency } from "@/lib/utils";

const BENEFICIOS = [
  {
    icon: ClipboardList,
    title: "Avaliação que se adapta a cada pessoa",
    text: "O candidato escolhe como quer responder: uma pergunta por tela, pausas, texto maior, perguntas explicadas passo a passo, leitura em voz alta ou resposta falada.",
  },
  {
    icon: UserCheck,
    title: "Candidatura sem cadastro",
    text: "O candidato abre o link da vaga e se candidata na hora, sem criar conta nem senha.",
  },
  {
    icon: ShieldCheck,
    title: "Apoio à Lei de Cotas",
    text: "Processos seletivos estruturados e acompanháveis, alinhados à Lei 8.213/91 e à LGPD.",
  },
];

const PASSOS = [
  { icon: ClipboardList, title: "Crie a vaga", text: "Descreva a vaga e as adaptações oferecidas." },
  { icon: Timer, title: "Monte o processo", text: "Adicione etapas e perguntas no seu ritmo." },
  { icon: Link2, title: "Compartilhe o link", text: "Envie o link para os candidatos." },
  { icon: LineChart, title: "Acompanhe", text: "Analise respostas e atualize o status." },
];

/** Landing page (FE10) */
export default function HomePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-navy text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div className="space-y-6">
              <Badge variant="secondary">Recrutamento neuroinclusivo</Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                Processos seletivos acessíveis para pessoas neurodivergentes
              </h1>
              <p className="text-lg text-white/85">
                A NeuroWork ajuda sua empresa a criar vagas e avaliações adaptadas, com uma candidatura simples, clara e
                sem pressão de tempo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-white text-navy hover:bg-white/90">
                  <Link href="/cadastro">
                    Criar conta da empresa
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="#como-funciona">Ver como funciona</Link>
                </Button>
              </div>
            </div>

            <div
              className="rounded-2xl border bg-background p-6 text-foreground shadow-sm"
              data-decorative
              aria-hidden="true"
            >
              <p className="mb-4 text-sm font-semibold text-muted-foreground">Prévia do painel</p>
              <div className="mb-4 grid grid-cols-3 gap-3">
                {[
                  ["2", "Vagas abertas"],
                  ["5", "Candidaturas"],
                  ["80%", "Concluídas"],
                ].map(([valor, rotulo]) => (
                  <div key={rotulo} className="rounded-lg border bg-card p-3">
                    <p className="text-2xl font-bold text-primary">{valor}</p>
                    <p className="text-xs text-muted-foreground">{rotulo}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["Desenvolvedor(a) Front-end", "Analista de Dados"].map((vaga) => (
                  <div
                    key={vaga}
                    className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                  >
                    {vaga}
                    <Badge variant="success">Aberta</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className="brand-gradient h-1" data-decorative aria-hidden="true" />

        <section aria-labelledby="titulo-beneficios" className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="titulo-beneficios" className="mb-8 text-center text-3xl font-bold text-navy">
            Por que usar a NeuroWork
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFICIOS.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="size-8 text-primary" aria-hidden="true" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="text-base">{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="como-funciona" aria-labelledby="titulo-como-funciona" className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 id="titulo-como-funciona" className="mb-8 text-center text-3xl font-bold text-navy">
              Como funciona
            </h2>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PASSOS.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="rounded-xl border bg-background p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="planos" aria-labelledby="titulo-planos" className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="titulo-planos" className="mb-2 text-center text-3xl font-bold text-navy">
            Planos
          </h2>
          <p className="mb-8 text-center text-muted-foreground">Assinatura mensal, sem fidelidade.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANOS.map((plano) => (
              <Card key={plano.id} className={plano.destaque ? "border-2 border-primary" : undefined}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plano.nome}</CardTitle>
                    {plano.destaque && <Badge>Mais escolhido</Badge>}
                  </div>
                  <CardDescription>{plano.descricao}</CardDescription>
                  <p className="pt-2 text-3xl font-bold">
                    {formatCurrency(plano.precoMensal)}
                    <span className="text-base font-normal text-muted-foreground">/mês</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plano.recursos.map((recurso) => (
                      <li key={recurso} className="flex gap-2">
                        <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                        {recurso}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={plano.destaque ? "default" : "outline"}>
                    <Link href="/cadastro">Começar</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-white/80 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Logo tone="inverse" size="sm" />
            <p>Trabalho de Conclusão de Curso — turma DS302.</p>
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-end">
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
