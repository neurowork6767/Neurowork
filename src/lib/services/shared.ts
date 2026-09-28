import { PLANOS } from "@/data/planos";
import { CANDIDATURA_STATUS_LABEL } from "@/lib/constants";
import type { Candidatura, CandidaturaStatus, Empresa, Plano, Vaga } from "@/types";

/**
 * Tipos e funções usados pelas duas implementações da camada de serviços
 * (dados de exemplo e Firebase), para que as telas recebam sempre o mesmo formato.
 */

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export type CadastroEmpresaInput = {
  nome: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  senha: string;
};

export type AtualizarEmpresaInput = Pick<Empresa, "nome" | "responsavel" | "telefone">;

export type VagaComResumo = Vaga & { totalCandidaturas: number };

export type CandidaturaComVaga = Candidatura & { vagaTitulo: string };

export type CandidaturaDetalhe = Candidatura & { vaga: Vaga };

export type ResumoPainel = {
  vagasAbertas: number;
  totalVagas: number;
  totalCandidaturas: number;
  candidaturasNovas: number;
  taxaConclusao: number;
};

export type RelatorioVaga = {
  vagaId: string;
  vagaTitulo: string;
  totalCandidatos: number;
  porStatus: { status: CandidaturaStatus; label: string; quantidade: number }[];
  avaliacoesConcluidas: number;
  taxaConclusao: number;
};

export function getLinkDaVaga(slug: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/vaga/${slug}`;
}

export function obterPlano(id: string): Plano | undefined {
  return PLANOS.find((p) => p.id === id);
}

export async function listarPlanos(): Promise<Plano[]> {
  return PLANOS;
}

export function calcularResumo(vagas: Vaga[], candidaturas: Candidatura[]): ResumoPainel {
  const concluidas = candidaturas.filter((c) => c.avaliacaoConcluida).length;
  return {
    vagasAbertas: vagas.filter((v) => v.status === "aberta").length,
    totalVagas: vagas.length,
    totalCandidaturas: candidaturas.length,
    candidaturasNovas: candidaturas.filter((c) => c.status === "nova").length,
    taxaConclusao: candidaturas.length ? Math.round((concluidas / candidaturas.length) * 100) : 0,
  };
}

export function montarRelatorio(vaga: Vaga, candidaturas: Candidatura[]): RelatorioVaga {
  const concluidas = candidaturas.filter((c) => c.avaliacaoConcluida).length;
  const statuses = Object.keys(CANDIDATURA_STATUS_LABEL) as CandidaturaStatus[];
  return {
    vagaId: vaga.id,
    vagaTitulo: vaga.titulo,
    totalCandidatos: candidaturas.length,
    porStatus: statuses.map((status) => ({
      status,
      label: CANDIDATURA_STATUS_LABEL[status],
      quantidade: candidaturas.filter((c) => c.status === status).length,
    })),
    avaliacoesConcluidas: concluidas,
    taxaConclusao: candidaturas.length ? Math.round((concluidas / candidaturas.length) * 100) : 0,
  };
}

export function comResumo(vagas: Vaga[], candidaturas: Candidatura[]): VagaComResumo[] {
  return [...vagas]
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
    .map((vaga) => ({ ...vaga, totalCandidaturas: candidaturas.filter((c) => c.vagaId === vaga.id).length }));
}

export function comTituloDaVaga(candidaturas: Candidatura[], vagas: Vaga[]): CandidaturaComVaga[] {
  return [...candidaturas]
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))
    .map((c) => ({ ...c, vagaTitulo: vagas.find((v) => v.id === c.vagaId)?.titulo ?? "" }));
}
