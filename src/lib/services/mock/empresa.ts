import type { Empresa, PlanoId } from "@/types";
import { calcularResumo, obterPlano, ServiceError, type AtualizarEmpresaInput, type ResumoPainel } from "../shared";
import { delay, readDb, requireSession, writeDb, writeSession } from "./storage";

export async function obterEmpresaAtual(): Promise<Empresa> {
  await delay(400);
  const { empresaId } = requireSession();
  const empresa = readDb().empresas.find((e) => e.id === empresaId);
  if (!empresa) throw new ServiceError("Empresa não encontrada.");
  return empresa;
}

/** CNPJ e e-mail não podem ser alterados aqui: essas mudanças exigem verificação. */
export async function atualizarEmpresa(input: AtualizarEmpresaInput): Promise<Empresa> {
  await delay(700);
  const sessao = requireSession();
  const db = readDb();
  const empresa = db.empresas.find((e) => e.id === sessao.empresaId);
  if (!empresa) throw new ServiceError("Empresa não encontrada.");

  Object.assign(empresa, input);
  // O nome da empresa também aparece nas páginas públicas das vagas
  db.vagas.filter((v) => v.empresaId === empresa.id).forEach((v) => (v.empresaNome = empresa.nome));
  writeDb(db);
  writeSession({ ...sessao, nome: empresa.nome });
  return empresa;
}

export async function obterResumoPainel(): Promise<ResumoPainel> {
  await delay();
  const { empresaId } = requireSession();
  const db = readDb();
  return calcularResumo(
    db.vagas.filter((v) => v.empresaId === empresaId),
    db.candidaturas.filter((c) => c.empresaId === empresaId)
  );
}

/** Contratação SIMULADA (FE14). Nenhum dado de pagamento é coletado ou enviado. */
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
