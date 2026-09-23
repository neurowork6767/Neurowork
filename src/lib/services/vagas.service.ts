import { createId, slugify } from "@/lib/utils";
import type { Empresa, Etapa, Vaga, VagaInput, VagaStatus } from "@/types";
import { delay, readDb, requireSession, ServiceError, writeDb } from "./storage";

export type VagaComResumo = Vaga & { totalCandidaturas: number };

export type VagaPublica = Vaga & { empresaNome: string };

function findVagaDaEmpresa(vagas: Vaga[], id: string, empresaId: string) {
  const vaga = vagas.find((v) => v.id === id && v.empresaId === empresaId);
  if (!vaga) throw new ServiceError("Vaga não encontrada.");
  return vaga;
}

export async function listarVagas(): Promise<VagaComResumo[]> {
  await delay();
  const { empresaId } = requireSession();
  const db = readDb();

  return db.vagas
    .filter((v) => v.empresaId === empresaId)
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
    .map((vaga) => ({
      ...vaga,
      totalCandidaturas: db.candidaturas.filter((c) => c.vagaId === vaga.id).length,
    }));
}

export async function obterVaga(id: string): Promise<Vaga> {
  await delay(400);
  const { empresaId } = requireSession();
  return findVagaDaEmpresa(readDb().vagas, id, empresaId);
}

/** Usada na página pública do candidato (FE16): não exige sessão. */
export async function obterVagaPublica(slug: string): Promise<VagaPublica> {
  await delay(500);
  const db = readDb();
  const vaga = db.vagas.find((v) => v.slug === slug);
  if (!vaga) throw new ServiceError("Este link de vaga não existe. Confira se ele foi copiado por completo.");
  if (vaga.status === "encerrada") throw new ServiceError("Esta vaga foi encerrada e não recebe novas candidaturas.");

  const empresa = db.empresas.find((e: Empresa) => e.id === vaga.empresaId);
  return { ...vaga, empresaNome: empresa?.nome ?? "Empresa" };
}

export async function criarVaga(input: VagaInput): Promise<Vaga> {
  await delay(700);
  const { empresaId } = requireSession();
  const db = readDb();

  const vaga: Vaga = {
    ...input,
    id: createId("vaga"),
    empresaId,
    slug: `${slugify(input.titulo)}-${Math.random().toString(36).slice(2, 6)}`,
    status: "aberta",
    etapas: [],
    criadaEm: new Date().toISOString(),
  };

  db.vagas.push(vaga);
  writeDb(db);
  return vaga;
}

export async function atualizarVaga(id: string, input: VagaInput): Promise<Vaga> {
  await delay(700);
  const { empresaId } = requireSession();
  const db = readDb();
  const vaga = findVagaDaEmpresa(db.vagas, id, empresaId);

  Object.assign(vaga, input);
  writeDb(db);
  return vaga;
}

export async function alterarStatusVaga(id: string, status: VagaStatus): Promise<Vaga> {
  await delay(500);
  const { empresaId } = requireSession();
  const db = readDb();
  const vaga = findVagaDaEmpresa(db.vagas, id, empresaId);

  vaga.status = status;
  writeDb(db);
  return vaga;
}

/** Salva as etapas e perguntas do processo seletivo (FE11). */
export async function salvarEtapas(id: string, etapas: Etapa[]): Promise<Vaga> {
  await delay(700);
  const { empresaId } = requireSession();
  const db = readDb();
  const vaga = findVagaDaEmpresa(db.vagas, id, empresaId);

  vaga.etapas = etapas;
  writeDb(db);
  return vaga;
}

export function getLinkDaVaga(slug: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/vaga/${slug}`;
}
