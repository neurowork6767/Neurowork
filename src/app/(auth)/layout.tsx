import { CheckCircle2 } from "lucide-react";

import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { Logo } from "@/components/brand/logo";
import { LogoSymbol } from "@/components/brand/logo-symbol";
import { SkipLink } from "@/components/layout/skip-link";

const DESTAQUES = [
  "Candidatura sem cadastro para o candidato",
  "Avaliações adaptadas e sem pressão de tempo",
  "Acompanhamento simples de cada processo seletivo",
];

/** Layout de cadastro, login e recuperação de senha: painel da marca + formulário. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Painel da marca: some no celular para o formulário aparecer primeiro */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-10 text-white lg:flex">
          <Logo href="/" tone="inverse" size="md" />

          <div className="relative z-10 space-y-6">
            <p className="font-heading text-3xl font-extrabold leading-tight">
              Recrutamento que respeita cada forma de pensar.
            </p>
            <ul className="space-y-3">
              {DESTAQUES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#66BB6A]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-sm text-white/70">A plataforma não solicita nem registra diagnósticos.</p>

          <div className="pointer-events-none absolute -bottom-16 -right-16 opacity-[0.07]" data-decorative>
            <LogoSymbol variant="white" className="size-80" />
          </div>
          <div className="brand-gradient absolute inset-x-0 bottom-0 h-1" data-decorative aria-hidden="true" />
        </aside>

        <div className="flex min-h-screen flex-col bg-background">
          <header className="flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
            <div className="lg:invisible">
              <Logo href="/" size="sm" />
            </div>
            <AccessibilityMenu />
          </header>
          <main
            id="conteudo"
            className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 sm:py-12"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
