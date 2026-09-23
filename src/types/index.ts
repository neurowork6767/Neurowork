/**
 * Tipos centrais do domínio. Eles já seguem o formato previsto para as
 * coleções do Firestore, para facilitar a troca dos dados de exemplo pelo banco real.
 */

export type PlanoId = "basic" | "pro" | "enterprise";

export type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  responsavel: string;
  plano: PlanoId | null;
  criadaEm: string;
};

export type Modalidade = "presencial" | "remoto" | "hibrido";
export type VagaStatus = "aberta" | "encerrada";

export type TipoPergunta = "dissertativa" | "multipla_escolha";

export type Pergunta = {
  id: string;
  enunciado: string;
  tipo: TipoPergunta;
  opcoes: string[];
};

export type Etapa = {
  id: string;
  titulo: string;
  instrucoes: string;
  perguntas: Pergunta[];
};

export type Vaga = {
  id: string;
  empresaId: string;
  slug: string;
  titulo: string;
  descricao: string;
  requisitos: string;
  modalidade: Modalidade;
  local: string;
  faixaSalarial: string;
  adaptacoes: string[];
  status: VagaStatus;
  etapas: Etapa[];
  criadaEm: string;
};

export type CandidaturaStatus = "nova" | "em_analise" | "aprovado" | "reprovado";

export type ArquivoInfo = {
  nome: string;
  tamanho: number;
};

export type Candidatura = {
  id: string;
  vagaId: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  curriculo: ArquivoInfo;
  portfolio: ArquivoInfo | null;
  portfolioLink: string;
  adaptacoes: string;
  consentimentoLgpd: boolean;
  status: CandidaturaStatus;
  /** Respostas da avaliação, indexadas pelo id da pergunta */
  respostas: Record<string, string>;
  avaliacaoConcluida: boolean;
  enviadaEm: string;
};

export type Plano = {
  id: PlanoId;
  nome: string;
  precoMensal: number;
  descricao: string;
  limiteVagas: number | null;
  recursos: string[];
  destaque?: boolean;
};

export type Sessao = {
  empresaId: string;
  nome: string;
  email: string;
};

/** Dados enviados pelo candidato ao criar a candidatura (FE17) */
export type NovaCandidatura = Omit<
  Candidatura,
  "id" | "vagaId" | "status" | "respostas" | "avaliacaoConcluida" | "enviadaEm"
>;

/** Dados do formulário de vaga (FE08) */
export type VagaInput = Pick<
  Vaga,
  "titulo" | "descricao" | "requisitos" | "modalidade" | "local" | "faixaSalarial" | "adaptacoes"
>;
