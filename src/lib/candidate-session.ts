/**
 * Guarda, só nesta aba do navegador (sessionStorage), o progresso do candidato:
 * qual candidatura ele enviou e o rascunho das respostas da avaliação.
 * Assim ele não perde as respostas ao navegar entre as etapas ou recarregar a página.
 */

type CandidateProgress = {
  candidaturaId: string;
  avaliacaoConcluida: boolean;
  rascunho: Record<string, string>;
  etapaAtual: number;
};

const key = (slug: string) => `neurowork:candidato:${slug}`;

export function readCandidateProgress(slug: string): CandidateProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as CandidateProgress) : null;
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
