import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";

import { AccessibilityProvider, accessibilityInitScript } from "@/components/accessibility/accessibility-provider";
import { Toaster } from "@/components/feedback/toaster";
import "./globals.css";

// Fontes do Manual de Identidade Visual (baixadas no build e servidas pelo próprio site)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
