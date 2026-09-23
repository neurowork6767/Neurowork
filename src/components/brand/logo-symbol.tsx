import { useId } from "react";

import { cn } from "@/lib/utils";

type LogoSymbolProps = {
  className?: string;
  /** "color" usa o degradê azul/verde da marca; "white" é a versão negativa, para fundos escuros. */
  variant?: "color" | "white";
  /** Texto alternativo. Deixe vazio quando o nome NeuroWork já aparece ao lado. */
  title?: string;
};

/**
 * Símbolo da marca (cérebro com circuitos), desenhado em SVG para ficar nítido em qualquer tamanho.
 * Recriado a partir do Manual de Identidade Visual; o arquivo equivalente está em public/brand/.
 */
export function LogoSymbol({ className, variant = "color", title }: LogoSymbolProps) {
  // IDs únicos: evita conflito de degradês quando o logo aparece mais de uma vez na página
  const uid = useId().replace(/:/g, "");
  const azul = variant === "white" ? "#ffffff" : `url(#${uid}-azul)`;
  const verde = variant === "white" ? "#ffffff" : `url(#${uid}-verde)`;
  const corAzul = variant === "white" ? "#ffffff" : "#1E88E5";
  const corAzulEscuro = variant === "white" ? "#ffffff" : "#1565C0";
  const corVerde = variant === "white" ? "#ffffff" : "#43A047";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-azul`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E88E5" />
          <stop offset="1" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id={`${uid}-verde`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2E9E48" />
          <stop offset="1" stopColor="#43A047" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
        <path
          stroke={azul}
          d="M29 11.5c-3.2-3.4-9.6-3-11.4 1.6-5.6-.2-9 5-7.2 10-4.4 2.6-4.8 9.4-.8 12.4-2.4 5 .6 11.4 6.8 11.6 1.4 3.6 4.6 5.8 8.4 6"
        />
        <path stroke={azul} d="M22.5 24v14.5l-4.5 1.5" />
        <path stroke={verde} d="M34.5 17v30.5c0 3-2 5-5 5.4" />
        <path
          stroke={verde}
          d="M34.5 17c0-4.6 5.4-7.6 10.4-4.6 5.4-.6 9.2 4.4 7.8 9.8 4.2 2.6 5 8.6 1.6 12.2 2.8 5-.4 11.6-6.8 11.8-1.2 3-3.6 4.8-6.4 5"
        />
        <path stroke={verde} strokeWidth="3" d="M34.5 33l7-10.5M34.5 33l6.5 5.5 7.5-5.5M41 38.5l-3.2 7.5" />
      </g>
      <circle cx="22.5" cy="23.5" r="4" fill={corAzul} />
      <circle cx="22.5" cy="39.5" r="4" fill={corAzulEscuro} />
      <circle cx="41.8" cy="21.8" r="3.6" fill={corVerde} />
      <circle cx="49" cy="33" r="3.6" fill={corVerde} />
      <circle cx="41" cy="38.5" r="3.4" fill={corVerde} />
      <circle cx="37.6" cy="46.4" r="3.2" fill={corVerde} />
    </svg>
  );
}
