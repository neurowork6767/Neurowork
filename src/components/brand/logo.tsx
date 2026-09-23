import Link from "next/link";

import { cn } from "@/lib/utils";
import { LogoSymbol } from "./logo-symbol";

type LogoProps = {
  /** Sem href, o logo é exibido sem link (ex.: na jornada do candidato). */
  href?: string;
  /** "default" para fundo claro; "inverse" para fundo azul-marinho (versão negativa do manual). */
  tone?: "default" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { symbol: "size-7", text: "text-lg" },
  md: { symbol: "size-9", text: "text-xl" },
  lg: { symbol: "size-12", text: "text-3xl" },
};

/** Logotipo na versão horizontal: símbolo + "Neuro" (azul-marinho) + "Work" (verde). */
export function Logo({ href, tone = "default", size = "md", className }: LogoProps) {
  const content = (
    <>
      <LogoSymbol className={SIZES[size].symbol} />
      <span className={cn("font-heading font-extrabold tracking-tight", SIZES[size].text)}>
        <span className={tone === "inverse" ? "text-white" : "text-navy"}>Neuro</span>
        <span className={tone === "inverse" ? "text-[#66BB6A]" : "text-brand-green"}>Work</span>
      </span>
    </>
  );

  const classes = cn("inline-flex items-center gap-2 rounded-md", className);

  if (!href) return <span className={classes}>{content}</span>;

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
