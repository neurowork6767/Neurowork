import type { CandidaturaStatus, Modalidade, VagaStatus } from "@/types";

export const MODALIDADES: { value: Modalidade; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "remoto", label: "Remoto" },
];

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  remoto: "Remoto",
};

export const VAGA_STATUS_LABEL: Record<VagaStatus, string> = {
  aberta: "Aberta",
  encerrada: "Encerrada",
};

export const CANDIDATURA_STATUS_LABEL: Record<CandidaturaStatus, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

/** Status que o recrutador pode escolher no detalhe do candidato (FE13) */
export const STATUS_SELECIONAVEIS: CandidaturaStatus[] = ["em_analise", "aprovado", "reprovado"];

/** Adaptações sugeridas ao criar uma vaga (FE08). A empresa pode adicionar outras. */
export const ADAPTACOES_SUGERIDAS = [
  "Avaliação sem limite de tempo",
  "Instruções escritas e em áudio",
  "Perguntas enviadas com antecedência",
  "Entrevista por texto ou vídeo, à escolha",
  "Ambiente de trabalho silencioso",
  "Horário flexível",
  "Pausas durante as etapas",
];

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
