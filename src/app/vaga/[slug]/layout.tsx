import type { Metadata } from "next";
import { BrainCircuit } from "lucide-react";

import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
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
          <p className="flex items-center gap-2 font-bold text-navy">
            <span
              className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <BrainCircuit className="size-5" />
            </span>
            NeuroWork
          </p>
          <AccessibilityMenu />
        </div>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        {children}
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-muted-foreground">
        Precisa de ajuda? Use o botão Acessibilidade no topo para ajustar a tela.
      </footer>
    </>
  );
}
