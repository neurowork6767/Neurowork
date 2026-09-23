import type { Metadata, Viewport } from "next";

import { AccessibilityProvider, accessibilityInitScript } from "@/components/accessibility/accessibility-provider";
import { Toaster } from "@/components/feedback/toaster";
import "./globals.css";

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
  themeColor: "#1e6b5c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
