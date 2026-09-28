import { seedCandidaturas, seedEmpresas, seedVagas } from "@/data/seed";
import type { Candidatura, Empresa, Sessao, Vaga } from "@/types";
import { ServiceError } from "../shared";

/**
 * "Banco de dados" do modo demonstração (usado quando o Firebase não está configurado).
 *
 * Os dados ficam no localStorage do navegador para que a vaga criada pela empresa
 * apareça na página do candidato e a candidatura enviada apareça no painel.
 */

type MockDatabase = {
  empresas: Empresa[];
  vagas: Vaga[];
  candidaturas: Candidatura[];
};

// A versão muda quando o formato dos dados muda; dados de versões antigas são descartados
const DB_KEY = "neurowork:db:v3";
const SESSION_KEY = "neurowork:sessao";

function seed(): MockDatabase {
  return structuredClone({ empresas: seedEmpresas, vagas: seedVagas, candidaturas: seedCandidaturas });
}

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new ServiceError("Os dados de exemplo só estão disponíveis no navegador.");
  }
}

export function readDb(): MockDatabase {
  assertBrowser();
  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) {
    const initial = seed();
    writeDb(initial);
    return initial;
  }
  try {
    return JSON.parse(raw) as MockDatabase;
  } catch {
    throw new ServiceError("Não foi possível ler os dados salvos. Use “Restaurar dados de exemplo”.");
  }
}

export function writeDb(db: MockDatabase) {
  assertBrowser();
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDb() {
  writeDb(seed());
}

export function readSession(): Sessao | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sessao;
  } catch {
    return null;
  }
}

export function writeSession(sessao: Sessao | null) {
  assertBrowser();
  if (sessao) window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  else window.localStorage.removeItem(SESSION_KEY);
}

export function requireSession(): Sessao {
  const sessao = readSession();
  if (!sessao) throw new ServiceError("Sua sessão expirou. Entre novamente.");
  return sessao;
}

/** Simula o tempo de resposta de um servidor, para que os estados de carregamento apareçam. */
export function delay(ms = 500) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
