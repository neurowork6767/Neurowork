"use client";

import { ErrorState } from "@/components/feedback/states";

/** Tela exibida se acontecer um erro inesperado em qualquer página. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="conteudo" className="mx-auto grid min-h-screen max-w-xl place-items-center px-4">
      <ErrorState
        title="Algo deu errado"
        message="Ocorreu um erro inesperado. Tente novamente; se continuar, recarregue a página."
        onRetry={reset}
      />
    </main>
  );
}
