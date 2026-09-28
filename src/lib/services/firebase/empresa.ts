import { collection, doc, getDoc, getDocs, query, updateDoc, where, writeBatch } from "firebase/firestore";

import type { Candidatura, Empresa, PlanoId, Vaga } from "@/types";
import { calcularResumo, obterPlano, ServiceError, type AtualizarEmpresaInput, type ResumoPainel } from "../shared";
import { COLECOES, empresaClient, executar, requireEmpresaUid } from "./client";
import { comId } from "./mappers";

export async function obterEmpresaAtual(): Promise<Empresa> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const snap = await getDoc(doc(empresaClient().db, COLECOES.empresas, uid));
    if (!snap.exists()) throw new ServiceError("Empresa não encontrada.");
    return comId<Empresa>(snap);
  });
}

/** CNPJ e e-mail não podem ser alterados aqui (a regra de segurança também bloqueia). */
export async function atualizarEmpresa(input: AtualizarEmpresaInput): Promise<Empresa> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();

    // Atualiza a empresa e o nome copiado nas vagas numa única operação (tudo ou nada)
    const vagas = await getDocs(query(collection(db, COLECOES.vagas), where("empresaId", "==", uid)));
    const lote = writeBatch(db);
    lote.update(doc(db, COLECOES.empresas, uid), { ...input });
    vagas.docs.forEach((v) => lote.update(v.ref, { empresaNome: input.nome }));
    await lote.commit();

    const snap = await getDoc(doc(db, COLECOES.empresas, uid));
    return comId<Empresa>(snap);
  });
}

export async function obterResumoPainel(): Promise<ResumoPainel> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const [vagas, candidaturas] = await Promise.all([
      getDocs(query(collection(db, COLECOES.vagas), where("empresaId", "==", uid))),
      getDocs(query(collection(db, COLECOES.candidaturas), where("empresaId", "==", uid))),
    ]);
    return calcularResumo(
      vagas.docs.map((d) => comId<Vaga>(d)),
      candidaturas.docs.map((d) => comId<Candidatura>(d))
    );
  });
}

/**
 * Contratação SIMULADA (FE14): só marca o plano, sem cobrança.
 * Com pagamento real, o plano deve ser ativado pelo servidor após a confirmação do pagamento.
 */
export async function contratarPlanoSimulado(planoId: PlanoId): Promise<Empresa> {
  return executar(async () => {
    if (!obterPlano(planoId)) throw new ServiceError("Plano inválido.");
    const uid = await requireEmpresaUid();
    const ref = doc(empresaClient().db, COLECOES.empresas, uid);
    await updateDoc(ref, { plano: planoId });
    return comId<Empresa>(await getDoc(ref));
  });
}
