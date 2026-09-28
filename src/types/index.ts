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
  /** Explicação direta do que a empresa quer saber (mostrada no ajuste "passo a passo") */
  orientacao: string;
  /** Exemplo de resposta (opcional) */
  exemplo: string;
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
  /** Copiado da empresa para a página pública da vaga não precisar ler dados da empresa */
  empresaNome: string;
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
  /** Copiado da vaga: permite à regra de segurança verificar o dono sem consultas extras */
  empresaId: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  curriculo: ArquivoInfo;
  portfolio: ArquivoInfo | null;
  certificados: ArquivoInfo[];
  portfolioLink: string;
  adaptacoes: string;
  consentimentoLgpd: boolean;
  status: CandidaturaStatus;
  /** Respostas da avaliação, indexadas pelo id da pergunta */
  respostas: Record<string, string>;
  avaliacaoConcluida: boolean;
  /**
   * Ajustes da avaliação que o PRÓPRIO candidato decidiu mostrar à empresa.
   * Nunca guardamos a condição (TEA, TDAH…), apenas os ajustes.
   */
  ajustesCompartilhados: string[];
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
  "id" | "vagaId" | "empresaId" | "status" | "respostas" | "avaliacaoConcluida" | "ajustesCompartilhados" | "enviadaEm"
>;

/** Dados do formulário de vaga (FE08) */
export type VagaInput = Pick<
  Vaga,
  "titulo" | "descricao" | "requisitos" | "modalidade" | "local" | "faixaSalarial" | "adaptacoes"
>;
