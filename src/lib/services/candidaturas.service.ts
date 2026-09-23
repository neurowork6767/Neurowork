import { createId } from "@/lib/utils";
import type { Candidatura, CandidaturaStatus, NovaCandidatura, Vaga } from "@/types";
import { delay, readDb, requireSession, ServiceError, writeDb } from "./storage";

export type CandidaturaComVaga = Candidatura & { vagaTitulo: string };

export type CandidaturaDetalhe = Candidatura & { vaga: Vaga };

function vagasDaEmpresa(empresaId: string) {
  return readDb().vagas.filter((v) => v.empresaId === empresaId);
}

export async function listarCandidaturas(filtro?: { vagaId?: string }): Promise<CandidaturaComVaga[]> {
  await delay();
  const { empresaId } = requireSession();
  const db = readDb();
  const vagas = vagasDaEmpresa(empresaId);
  const vagaIds = new Set(vagas.map((v) => v.id));

  return db.candidaturas
    .filter((c) => vagaIds.has(c.vagaId))
    .filter((c) => !filtro?.vagaId || c.vagaId === filtro.vagaId)
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))
    .map((c) => ({ ...c, vagaTitulo: vagas.find((v) => v.id === c.vagaId)?.titulo ?? "" }));
}

export async function obterCandidatura(id: string): Promise<CandidaturaDetalhe> {
  await delay(400);
  const { empresaId } = requireSession();
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === id);
  const vaga = db.vagas.find((v) => v.id === candidatura?.vagaId && v.empresaId === empresaId);

  if (!candidatura || !vaga) throw new ServiceError("Candidatura não encontrada.");
  return { ...candidatura, vaga };
}

export async function alterarStatusCandidatura(id: string, status: CandidaturaStatus): Promise<Candidatura> {
  await delay(500);
  const { empresaId } = requireSession();
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === id);
  const pertenceAEmpresa = db.vagas.some((v) => v.id === candidatura?.vagaId && v.empresaId === empresaId);

  if (!candidatura || !pertenceAEmpresa) throw new ServiceError("Candidatura não encontrada.");
  candidatura.status = status;
  writeDb(db);
  return candidatura;
}

/* ---------- Operações públicas, usadas pelo candidato (sem conta) ---------- */

export async function enviarCandidatura(vagaId: string, dados: NovaCandidatura): Promise<Candidatura> {
  await delay(900);
  const db = readDb();
  const vaga = db.vagas.find((v) => v.id === vagaId);

  if (!vaga || vaga.status !== "aberta") throw new ServiceError("Esta vaga não está recebendo candidaturas.");
  if (!dados.consentimentoLgpd) throw new ServiceError("É preciso aceitar o uso dos dados para continuar.");

  const candidatura: Candidatura = {
    ...dados,
    id: createId("cand"),
    vagaId,
    status: "nova",
    respostas: {},
    avaliacaoConcluida: vaga.etapas.length === 0,
    enviadaEm: new Date().toISOString(),
  };

  db.candidaturas.push(candidatura);
  writeDb(db);
  return candidatura;
}

export async function salvarRespostas(
  candidaturaId: string,
  respostas: Record<string, string>,
  concluir: boolean
): Promise<void> {
  await delay(concluir ? 800 : 300);
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === candidaturaId);

  if (!candidatura) throw new ServiceError("Não encontramos sua candidatura. Abra o link da vaga novamente.");
  if (candidatura.avaliacaoConcluida) throw new ServiceError("Esta avaliação já foi enviada.");

  candidatura.respostas = respostas;
  candidatura.avaliacaoConcluida = concluir;
  writeDb(db);
}
