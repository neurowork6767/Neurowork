import type { AjusteId } from "./ajustes";

/**
 * Guarda, só nesta aba do navegador (sessionStorage), o progresso do candidato:
 * a candidatura enviada, os ajustes escolhidos e o rascunho das respostas.
 * Assim ele não perde nada ao navegar entre as telas ou recarregar a página.
 *
 * A condição escolhida no atalho (TEA, TDAH…) NÃO é guardada: só os ajustes.
 */

export type CandidateProgress = {
  candidaturaId: string;
  avaliacaoConcluida: boolean;
  rascunho: Record<string, string>;
  /** Posição atual na avaliação (pergunta ou etapa, conforme o modo) */
  posicao: number;
  ajustes: AjusteId[];
  /** O candidato já passou pela tela de ajustes */
  ajustesDefinidos: boolean;
};

const PADRAO: Omit<CandidateProgress, "candidaturaId"> = {
  avaliacaoConcluida: false,
  rascunho: {},
  posicao: 0,
  ajustes: [],
  ajustesDefinidos: false,
};

const key = (slug: string) => `neurowork:candidato:${slug}`;

export function readCandidateProgress(slug: string): CandidateProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key(slug));
    if (!raw) return null;
    const salvo = JSON.parse(raw) as Partial<CandidateProgress>;
    if (!salvo.candidaturaId) return null;
    return { ...PADRAO, ...salvo, candidaturaId: salvo.candidaturaId };
  } catch {
    return null;
  }
}

export function writeCandidateProgress(slug: string, progress: CandidateProgress) {
  try {
    window.sessionStorage.setItem(key(slug), JSON.stringify(progress));
  } catch {
    // sessionStorage indisponível: o progresso vale só enquanto a página estiver aberta
  }
}

export function updateCandidateProgress(slug: string, changes: Partial<CandidateProgress>) {
  const current = readCandidateProgress(slug);
  if (!current) return;
  writeCandidateProgress(slug, { ...current, ...changes });
}

export function novoProgresso(candidaturaId: string, avaliacaoConcluida: boolean): CandidateProgress {
  return { ...PADRAO, candidaturaId, avaliacaoConcluida };
}
