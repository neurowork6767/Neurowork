"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Reconhecimento de voz do próprio navegador (Web Speech API).
 * Funciona no Chrome e no Edge; em navegadores sem suporte o botão não aparece.
 * O TypeScript não traz esses tipos, então declaramos só o que usamos.
 */
type SpeechRecognitionResultLike = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Transforma fala em texto. `onTexto` recebe cada trecho final reconhecido. */
export function useSpeechRecognition(onTexto: (texto: string) => void) {
  const [suportado, setSuportado] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTextoRef = useRef(onTexto);
  onTextoRef.current = onTexto;

  useEffect(() => {
    setSuportado(getConstructor() !== null);
    return () => recognitionRef.current?.stop();
  }, []);

  const iniciar = useCallback(() => {
    const Constructor = getConstructor();
    if (!Constructor) return;
    setErro(null);
    const recognition = new Constructor();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i];
        if (resultado.isFinal) onTextoRef.current(resultado[0].transcript.trim());
      }
    };
    recognition.onerror = (event) => {
      setErro(
        event.error === "not-allowed"
          ? "Permita o uso do microfone no navegador para responder falando."
          : "Não foi possível ouvir. Tente de novo."
      );
    };
    recognition.onend = () => setOuvindo(false);
    recognitionRef.current = recognition;
    recognition.start();
    setOuvindo(true);
  }, []);

  const parar = useCallback(() => {
    recognitionRef.current?.stop();
    setOuvindo(false);
  }, []);

  return { suportado, ouvindo, erro, iniciar, parar };
}
