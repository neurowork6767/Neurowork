"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SpeakButton } from "@/components/accessibility/speak-button";
import { SuccessState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/vagas/confirm-dialog";
import { readCandidateProgress, removeCandidateProgress } from "@/lib/candidate-session";
import { excluirMinhaCandidatura } from "@/lib/services";

const PROXIMOS_PASSOS = [
  "A empresa vai ler sua candidatura e suas respostas.",
  "Se você avançar, a empresa entra em contato pelo e-mail ou telefone que você informou.",
  "Você pode fechar esta página. Não é preciso fazer mais nada agora.",
];

/** Tela de conclusão da candidatura (FE19), com a opção de excluir os dados (LGPD). */
export default function ConcluidoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [candidaturaId, setCandidaturaId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [excluida, setExcluida] = React.useState(false);

  React.useEffect(() => {
    setCandidaturaId(readCandidateProgress(slug)?.candidaturaId ?? null);
  }, [slug]);

  async function excluir() {
    if (!candidaturaId) return;
    try {
      await excluirMinhaCandidatura(candidaturaId);
      removeCandidateProgress(slug);
      setExcluida(true);
      toast.success("Sua candidatura foi excluída.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir. Tente de novo.");
    }
  }

  if (excluida) {
    return (
      <SuccessState
        titleAs="h1"
        title="Candidatura excluída"
        description="Seus dados e suas respostas foram apagados. A empresa não verá mais esta candidatura."
      />
    );
  }

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

      {candidaturaId && (
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Mudou de ideia? Você pode apagar sua candidatura e todos os seus dados.
          </p>
          <Button variant="ghost" className="text-destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden="true" />
            Excluir minha candidatura
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir sua candidatura?"
        description="Seus dados, arquivos e respostas serão apagados e a empresa não verá mais a candidatura. Não é possível desfazer."
        confirmLabel="Excluir"
        destructive
        onConfirm={excluir}
      />
    </div>
  );
}
