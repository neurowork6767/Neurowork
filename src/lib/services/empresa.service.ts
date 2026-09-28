import { PLANOS } from "@/data/planos";
import type { Empresa, Plano, PlanoId } from "@/types";
import { delay, readDb, requireSession, ServiceError, writeDb, writeSession } from "./storage";

export type ResumoPainel = {
  vagasAbertas: number;
  totalVagas: number;
  totalCandidaturas: number;
  candidaturasNovas: number;
  taxaConclusao: number;
};

export async function obterEmpresaAtual(): Promise<Empresa> {
  await delay(400);
  const { empresaId } = requireSession();
  const empresa = readDb().empresas.find((e) => e.id === empresaId);
  if (!empresa) throw new ServiceError("Empresa não encontrada.");
  return empresa;
}

export type AtualizarEmpresaInput = Pick<Empresa, "nome" | "responsavel" | "telefone">;

/**
 * Atualiza os dados da empresa logada. CNPJ e e-mail não podem ser alterados aqui:
 * na versão com back-end, essas mudanças exigirão verificação.
 */
export async function atualizarEmpresa(input: AtualizarEmpresaInput): Promise<Empresa> {
  await delay(700);
  const sessao = requireSession();
  const db = readDb();
  const empresa = db.empresas.find((e) => e.id === sessao.empresaId);
  if (!empresa) throw new ServiceError("Empresa não encontrada.");

  empresa.nome = input.nome;
  empresa.responsavel = input.responsavel;
  empresa.telefone = input.telefone;
  writeDb(db);
  writeSession({ ...sessao, nome: empresa.nome });
  return empresa;
}

export async function obterResumoPainel(): Promise<ResumoPainel> {
  await delay();
  const { empresaId } = requireSession();
  const db = readDb();
  const vagas = db.vagas.filter((v) => v.empresaId === empresaId);
  const ids = new Set(vagas.map((v) => v.id));
  const candidaturas = db.candidaturas.filter((c) => ids.has(c.vagaId));
  const concluidas = candidaturas.filter((c) => c.avaliacaoConcluida).length;

  return {
    vagasAbertas: vagas.filter((v) => v.status === "aberta").length,
    totalVagas: vagas.length,
    totalCandidaturas: candidaturas.length,
    candidaturasNovas: candidaturas.filter((c) => c.status === "nova").length,
    taxaConclusao: candidaturas.length ? Math.round((concluidas / candidaturas.length) * 100) : 0,
  };
}

export async function listarPlanos(): Promise<Plano[]> {
  await delay(400);
  return PLANOS;
}

export function obterPlano(id: string): Plano | undefined {
  return PLANOS.find((p) => p.id === id);
}

/**
 * Contratação SIMULADA (FE14). Nenhum dado de pagamento é coletado ou enviado.
 * Na versão com back-end, o plano só será ativado após confirmação do gateway de pagamento.
 */
export async function contratarPlanoSimulado(planoId: PlanoId): Promise<Empresa> {
  await delay(1200);
  const { empresaId } = requireSession();
  const db = readDb();
  const empresa = db.empresas.find((e) => e.id === empresaId);
  if (!empresa) throw new ServiceError("Empresa não encontrada.");
  if (!obterPlano(planoId)) throw new ServiceError("Plano inválido.");

  empresa.plano = planoId;
  writeDb(db);
  return empresa;
}
