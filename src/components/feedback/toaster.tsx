"use client";

import { Toaster as SonnerToaster } from "sonner";

/** Mensagens de feedback (toast) exibidas no topo, com cores de sucesso/erro e botão de fechar. */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={5000}
      toastOptions={{ className: "text-base" }}
    />
  );
}
