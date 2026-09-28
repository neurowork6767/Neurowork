import type { Metadata } from "next";
import Link from "next/link";

import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { Logo } from "@/components/brand/logo";
import { SkipLink } from "@/components/layout/skip-link";

export const metadata: Metadata = {
  title: "Candidatura",
};

/** Layout da jornada do candidato: poucos elementos, foco no conteúdo (E4). */
export default function CandidatoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <Logo size="sm" />
          <AccessibilityMenu />
        </div>
        <div className="brand-gradient h-1" data-decorative aria-hidden="true" />
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        {children}
      </main>
      <footer className="mx-auto max-w-3xl space-y-1 px-4 pb-8 text-center text-sm text-muted-foreground">
        <p>Precisa de ajuda? Use o botão Acessibilidade no topo para ajustar a tela.</p>
        <p>
          <Link href="/privacidade" className="font-medium text-primary underline-offset-4 hover:underline">
            Como usamos seus dados
          </Link>
        </p>
      </footer>
    </>
  );
}
