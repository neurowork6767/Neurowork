import { createId } from "@/lib/utils";
import type { ArquivoInfo, Candidatura, CandidaturaStatus, NovaCandidatura } from "@/types";
import {
  comTituloDaVaga,
  idsDosArquivos,
  prepararArquivos,
  ServiceError,
  type ArquivoConteudo,
  type ArquivoGuardado,
  type CandidaturaComVaga,
  type CandidaturaDetalhe,
} from "../shared";
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

/* ---------- PDFs: no modo demonstração ficam no localStorage, um por chave ---------- */

const chaveDoArquivo = (id: string) => `neurowork:arquivo:${id}`;

/** Devolve false se o navegador não tiver espaço para guardar o arquivo. */
function guardarArquivo(arquivo: ArquivoGuardado): boolean {
  try {
    window.localStorage.setItem(
      chaveDoArquivo(arquivo.id),
      JSON.stringify({ nome: arquivo.nome, conteudo: arquivo.conteudo })
    );
    return true;
  } catch {
    return false;
  }
}

function apagarArquivos(candidatura: Candidatura) {
  for (const id of idsDosArquivos(candidatura)) window.localStorage.removeItem(chaveDoArquivo(id));
}

/** A empresa abre um PDF enviado pelo candidato. */
export async function obterArquivo(candidaturaId: string, arquivoId: string): Promise<ArquivoConteudo> {
  await delay(300);
  const { empresaId } = requireSession();
  const candidatura = readDb().candidaturas.find((c) => c.id === candidaturaId && c.empresaId === empresaId);
  const salvo =
    candidatura && idsDosArquivos(candidatura).includes(arquivoId)
      ? window.localStorage.getItem(chaveDoArquivo(arquivoId))
      : null;
  if (!salvo) throw new ServiceError("Arquivo não encontrado.");
  return JSON.parse(salvo) as ArquivoConteudo;
}

/** Exclui a candidatura e todos os dados do candidato, PDFs incluídos (direito de exclusão da LGPD). */
export async function excluirCandidatura(id: string): Promise<void> {
  await delay(500);
  const { empresaId } = requireSession();
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === id && c.empresaId === empresaId);
  if (!candidatura) throw new ServiceError("Candidatura não encontrada.");
  apagarArquivos(candidatura);
  db.candidaturas = db.candidaturas.filter((c) => c.id !== id);
  writeDb(db);
}

/* ---------- Operações públicas, usadas pelo candidato (sem conta) ---------- */

/** O próprio candidato apaga a candidatura que enviou nesta sessão. */
export async function excluirMinhaCandidatura(candidaturaId: string): Promise<void> {
  await delay(500);
  const db = readDb();
  const candidatura = db.candidaturas.find((c) => c.id === candidaturaId);
  if (!candidatura) throw new ServiceError("Candidatura não encontrada. Ela pode já ter sido excluída.");
  apagarArquivos(candidatura);
  db.candidaturas = db.candidaturas.filter((c) => c.id !== candidaturaId);
  writeDb(db);
}

export async function enviarCandidatura(vagaId: string, dados: NovaCandidatura): Promise<Candidatura> {
  await delay(900);
  const db = readDb();
  const vaga = db.vagas.find((v) => v.id === vagaId);

  if (!vaga || vaga.status !== "aberta") throw new ServiceError("Esta vaga não está recebendo candidaturas.");
  if (!dados.consentimentoLgpd) throw new ServiceError("É preciso aceitar o uso dos dados para continuar.");

  // Se o navegador não tiver espaço para algum PDF, fica registrado só o nome e o tamanho
  const arquivos = prepararArquivos(dados, () => createId("arq"));
  const semEspaco = new Set(arquivos.guardados.filter((a) => !guardarArquivo(a)).map((a) => a.id));
  const registrado = (arquivo: ArquivoInfo): ArquivoInfo =>
    arquivo.id && semEspaco.has(arquivo.id) ? { nome: arquivo.nome, tamanho: arquivo.tamanho } : arquivo;

  const candidatura: Candidatura = {
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    cidade: dados.cidade,
    curriculo: registrado(arquivos.curriculo),
    portfolio: arquivos.portfolio ? registrado(arquivos.portfolio) : null,
    certificados: arquivos.certificados.map(registrado),
    portfolioLink: dados.portfolioLink,
    adaptacoes: dados.adaptacoes,
    consentimentoLgpd: dados.consentimentoLgpd,
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
