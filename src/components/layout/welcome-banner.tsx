import * as React from "react";

import { LogoSymbol } from "@/components/brand/logo-symbol";

type WelcomeBannerProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
};

/** Faixa de boas-vindas no topo do painel, nas cores da marca. */
export function WelcomeBanner({ title, description, actions }: WelcomeBannerProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-8">
      <div className="relative z-10 max-w-2xl space-y-2">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="text-white/85">{description}</p>
        {actions && <div className="flex flex-wrap gap-3 pt-3">{actions}</div>}
      </div>
      <div className="pointer-events-none absolute -right-10 -top-10 hidden opacity-10 sm:block" data-decorative>
        <LogoSymbol variant="white" className="size-56" />
      </div>
      <div className="brand-gradient absolute inset-x-0 bottom-0 h-1" data-decorative aria-hidden="true" />
    </section>
  );
}
