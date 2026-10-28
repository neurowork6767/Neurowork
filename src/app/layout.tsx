import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AccessibilityProvider, accessibilityInitScript } from "@/components/accessibility/accessibility-provider";
import { Toaster } from "@/components/feedback/toaster";
import "./globals.css";

// Fontes do Manual de Identidade Visual, guardadas no próprio projeto (src/app/fonts).
// Assim o build não depende de baixar as fontes do Google Fonts, o que pode falhar na Vercel.
// São fontes variáveis com só os pesos usados e os caracteres do português (licença OFL).
const montserrat = localFont({
  src: "./fonts/Montserrat-latin.woff",
  weight: "600 800",
  variable: "--font-montserrat",
  display: "swap",
});
const roboto = localFont({
  src: "./fonts/Roboto-latin.woff",
  weight: "400 700",
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NeuroWork — Recrutamento neuroinclusivo",
    template: "%s | NeuroWork",
  },
  description:
    "Plataforma de recrutamento e seleção com foco em neuroinclusão: processos seletivos acessíveis, com candidatura sem cadastro.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d2a5c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: accessibilityInitScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <AccessibilityProvider>
          {children}
          <Toaster />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
