import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="conteudo" className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md text-center">
        <SearchX className="mx-auto mb-4 size-12 text-primary" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-bold text-navy">Página não encontrada</h1>
        <p className="mb-6 text-muted-foreground">O endereço pode estar incompleto ou a página foi removida.</p>
        <Button asChild>
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    </main>
  );
}
