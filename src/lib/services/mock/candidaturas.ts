import { createId } from "@/lib/utils";
import type { Candidatura, CandidaturaStatus, NovaCandidatura } from "@/types";
import { comTituloDaVaga, ServiceError, type CandidaturaComVaga, type CandidaturaDetalhe } from "../shared";
import { delay, readDb, requireSession, writeDb } from "./storage";

export async function listarCandidaturas(filtro?: { vagaId?: string }): Promise<CandidaturaComVaga[]> {
  await delay();
  const { empresaId } = requireSession();
  const db = readDb();
  const candidaturas = db.candidaturas.filter(
    (c) => c.empresaId === empresaId && (!filtro?.vagaId || c.vagaId === filtro.vagaId)
  );
  return comTituloDaVaga(candidaturas, db.vagas);
}

export async function obterCandidatura(id: string): Promise<CandidaturaDetalhe> {
  await delay(400);
  const { empresaId } = requireSession();
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === id && c.empresaId === empresaId);
  const vaga = db.vagas.find((v) => v.id === candidatura?.vagaId);
  if (!candidatura || !vaga) throw new ServiceError("Candidatura não encontrada.");
  return { ...candidatura, vaga };
}

export async function alterarStatusCandidatura(id: string, status: CandidaturaStatus): Promise<Candidatura> {
  await delay(500);
  const { empresaId } = requireSession();
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === id && c.empresaId === empresaId);
  if (!candidatura) throw new ServiceError("Candidatura não encontrada.");
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
    empresaId: vaga.empresaId,
    status: "nova",
    respostas: {},
    avaliacaoConcluida: vaga.etapas.length === 0,
    ajustesCompartilhados: [],
    enviadaEm: new Date().toISOString(),
  };

  db.candidaturas.push(candidatura);
  writeDb(db);
  return candidatura;
}

function findCandidaturaAberta(candidaturas: Candidatura[], id: string) {
  const candidatura = candidaturas.find((c) => c.id === id);
  if (!candidatura) throw new ServiceError("Não encontramos sua candidatura. Abra o link da vaga novamente.");
  if (candidatura.avaliacaoConcluida) throw new ServiceError("Esta avaliação já foi enviada.");
  return candidatura;
}

export async function salvarRespostas(
  candidaturaId: string,
  respostas: Record<string, string>,
  concluir: boolean
): Promise<void> {
  await delay(concluir ? 800 : 300);
  const db = readDb();
  const candidatura = findCandidaturaAberta(db.candidaturas, candidaturaId);
  candidatura.respostas = respostas;
  candidatura.avaliacaoConcluida = concluir;
  writeDb(db);
}

/** Guarda só os ajustes que o candidato escolheu mostrar à empresa (nunca a condição). */
export async function compartilharAjustes(candidaturaId: string, ajustes: string[]): Promise<void> {
  await delay(300);
  const db = readDb();
  const candidatura = findCandidaturaAberta(db.candidaturas, candidaturaId);
  candidatura.ajustesCompartilhados = ajustes;
  writeDb(db);
}
