"use client";

import { SuccessState } from "@/components/feedback/states";
import { SpeakButton } from "@/components/accessibility/speak-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROXIMOS_PASSOS = [
  "A empresa vai ler sua candidatura e suas respostas.",
  "Se você avançar, a empresa entra em contato pelo e-mail ou telefone que você informou.",
  "Você pode fechar esta página. Não é preciso fazer mais nada agora.",
];

/** Tela de conclusão da candidatura (FE19) */
export default function ConcluidoPage() {
  const textoParaOuvir = `Candidatura enviada! Próximos passos: ${PROXIMOS_PASSOS.join(" ")}`;

  return (
    <div className="space-y-6">
      <SuccessState
        titleAs="h1"
        title="Candidatura enviada!"
        description="Obrigado por participar. Recebemos seus dados e suas respostas."
        action={<SpeakButton text={textoParaOuvir} label="Ouvir esta mensagem" />}
      />

      <Card>
        <CardHeader>
          <CardTitle as="h2">O que acontece agora</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {PROXIMOS_PASSOS.map((passo, i) => (
              <li key={passo} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5">{passo}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
