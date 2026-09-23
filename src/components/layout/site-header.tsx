import Link from "next/link";

import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

/** Cabeçalho das páginas públicas (landing e autenticação). */
export function SiteHeader({ showAuthLinks = true }: { showAuthLinks?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav aria-label="Principal" className="flex items-center gap-2">
          <AccessibilityMenu />
          {showAuthLinks && (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/cadastro">Criar conta</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
