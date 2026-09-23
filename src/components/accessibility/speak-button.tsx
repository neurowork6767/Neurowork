"use client";

import * as React from "react";
import { Square, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type SpeakButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

/**
 * Lê o texto em voz alta com a síntese de voz do próprio navegador (FE04).
 * Se o navegador não oferecer o recurso, o botão não aparece.
 */
export function SpeakButton({ text, label = "Ouvir", className }: SpeakButtonProps) {
  const [supported, setSupported] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);

  React.useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function handleClick() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
      aria-pressed={speaking}
    >
      {speaking ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
      {speaking ? "Parar" : label}
    </Button>
  );
}
