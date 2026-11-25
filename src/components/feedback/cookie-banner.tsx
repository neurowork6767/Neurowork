"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";

export type EscolhaCookies = "todos" | "essenciais";

/** Chave no sessionStorage: a escolha vale só até a pessoa fechar o navegador. */
export const COOKIES_STORAGE_KEY = "neurowork:cookies";

/** Escolha feita nesta visita, ou null se a pessoa ainda não respondeu. */
export function obterEscolhaCookies(): EscolhaCookies | null {
  try {
    const valor = window.sessionStorage.getItem(COOKIES_STORAGE_KEY);
    return valor === "todos" || valor === "essenciais" ? valor : null;
  } catch {
    return null;
  }
}

/**
 * Aviso de cookies (LGPD). Aparece toda vez que a pessoa entra no site:
 * a escolha fica no sessionStorage, então vale enquanto o navegador estiver aberto
 * e o aviso volta na próxima visita. Não bloqueia a página nem rouba o foco.
 */
export function CookieBanner() {
  const [visivel, setVisivel] = React.useState(false);
  const tituloId = React.useId();
  const textoId = React.useId();

  React.useEffect(() => {
    if (obterEscolhaCookies() === null) setVisivel(true);
  }, []);

  function escolher(escolha: EscolhaCookies) {
    try {
      window.sessionStorage.setItem(COOKIES_STORAGE_KEY, escolha);
    } catch {
      // sessionStorage indisponível: o aviso some só nesta página
    }
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <section
      role="region"
      aria-labelledby={tituloId}
      aria-describedby={textoId}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card p-4 shadow-[0_-4px_16px_rgba(13,42,92,0.12)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:rounded-lg sm:border"
    >
      <div className="flex items-start gap-3">
        <Cookie aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="space-y-3">
          <h2 id={tituloId} className="text-base font-bold text-navy">
            Este site usa cookies
          </h2>
          <p id={textoId} className="text-sm text-foreground">
            Usamos cookies e o armazenamento do navegador para manter você conectado, guardar suas preferências de
            acessibilidade e salvar o progresso da candidatura. Não usamos cookies de publicidade.{" "}
            <Link href="/privacidade" className="font-medium text-primary underline underline-offset-4">
              Saiba mais
            </Link>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => escolher("todos")}>Aceitar cookies</Button>
            <Button variant="outline" onClick={() => escolher("essenciais")}>
              Só os essenciais
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
