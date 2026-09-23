import { DEMO_LOGIN } from "@/data/seed";
import { createId } from "@/lib/utils";
import type { Empresa, Sessao } from "@/types";
import { delay, readDb, readSession, ServiceError, writeDb, writeSession } from "./storage";

export type CadastroEmpresaInput = {
  nome: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  senha: string;
};

function toSessao(empresa: Empresa): Sessao {
  return { empresaId: empresa.id, nome: empresa.nome, email: empresa.email };
}

/**
 * Login simulado. A senha só é conferida na conta de demonstração: nesta versão
 * nenhuma senha é armazenada. A autenticação real será feita pelo Firebase Authentication.
 */
export async function login(email: string, senha: string): Promise<Sessao> {
  await delay(700);
  const db = readDb();
  const empresa = db.empresas.find((e) => e.email.toLowerCase() === email.toLowerCase());

  if (!empresa) throw new ServiceError("E-mail ou senha incorretos.");
  if (empresa.email === DEMO_LOGIN.email && senha !== DEMO_LOGIN.senha) {
    throw new ServiceError("E-mail ou senha incorretos.");
  }

  const sessao = toSessao(empresa);
  writeSession(sessao);
  return sessao;
}

export async function cadastrarEmpresa(input: CadastroEmpresaInput): Promise<Sessao> {
  await delay(800);
  const db = readDb();

  if (db.empresas.some((e) => e.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ServiceError("Já existe uma conta com este e-mail.");
  }
  if (db.empresas.some((e) => e.cnpj === input.cnpj)) {
    throw new ServiceError("Já existe uma conta com este CNPJ.");
  }

  const empresa: Empresa = {
    id: createId("emp"),
    nome: input.nome,
    cnpj: input.cnpj,
    email: input.email,
    telefone: input.telefone,
    responsavel: input.responsavel,
    plano: null,
    criadaEm: new Date().toISOString(),
  };

  db.empresas.push(empresa);
  writeDb(db);

  const sessao = toSessao(empresa);
  writeSession(sessao);
  return sessao;
}

/** Simula o envio do e-mail de recuperação. Por segurança, a resposta é a mesma exista ou não a conta. */
export async function recuperarSenha(email: string): Promise<void> {
  await delay(700);
  void email;
}

export function logout() {
  writeSession(null);
}

export function getSessao(): Sessao | null {
  return readSession();
}
