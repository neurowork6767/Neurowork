import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

import type { Candidatura, CandidaturaStatus, NovaCandidatura, Vaga } from "@/types";
import { comTituloDaVaga, ServiceError, type CandidaturaComVaga, type CandidaturaDetalhe } from "../shared";
import {
  candidatoClient,
  COLECOES,
  empresaClient,
  executar,
  garantirCandidatoAnonimo,
  requireEmpresaUid,
} from "./client";
import { comId } from "./mappers";

export async function listarCandidaturas(filtro?: { vagaId?: string }): Promise<CandidaturaComVaga[]> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const filtros = [where("empresaId", "==", uid)];
    if (filtro?.vagaId) filtros.push(where("vagaId", "==", filtro.vagaId));

    const [candidaturas, vagas] = await Promise.all([
      getDocs(query(collection(db, COLECOES.candidaturas), ...filtros)),
      getDocs(query(collection(db, COLECOES.vagas), where("empresaId", "==", uid))),
    ]);
    return comTituloDaVaga(
      candidaturas.docs.map((d) => comId<Candidatura>(d)),
      vagas.docs.map((d) => comId<Vaga>(d))
    );
  });
}

export async function obterCandidatura(id: string): Promise<CandidaturaDetalhe> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const snap = await getDoc(doc(db, COLECOES.candidaturas, id));
    if (!snap.exists() || snap.data().empresaId !== uid) throw new ServiceError("Candidatura não encontrada.");
    const candidatura = comId<Candidatura>(snap);
    const vaga = await getDoc(doc(db, COLECOES.vagas, candidatura.vagaId));
    if (!vaga.exists()) throw new ServiceError("A vaga desta candidatura não existe mais.");
    return { ...candidatura, vaga: comId<Vaga>(vaga) };
  });
}

export async function alterarStatusCandidatura(id: string, status: CandidaturaStatus): Promise<Candidatura> {
  return executar(async () => {
    await requireEmpresaUid();
    const { db } = empresaClient();
    const ref = doc(db, COLECOES.candidaturas, id);
    await updateDoc(ref, { status });
    const snap = await getDoc(ref);
    return comId<Candidatura>(snap);
  });
}

/* ---------- Operações do candidato (login anônimo, sem conta) ---------- */

export async function enviarCandidatura(vagaId: string, dados: NovaCandidatura): Promise<Candidatura> {
  return executar(async () => {
    if (!dados.consentimentoLgpd) throw new ServiceError("É preciso aceitar o uso dos dados para continuar.");
    const candidatoUid = await garantirCandidatoAnonimo();
    const { db } = candidatoClient();

    const vagaSnap = await getDoc(doc(db, COLECOES.vagas, vagaId));
    if (!vagaSnap.exists()) throw new ServiceError("Esta vaga não está recebendo candidaturas.");
    const vaga = comId<Vaga>(vagaSnap);

    const registro: Omit<Candidatura, "id"> & { candidatoUid: string } = {
      ...dados,
      vagaId,
      empresaId: vaga.empresaId,
      candidatoUid,
      status: "nova",
      respostas: {},
      avaliacaoConcluida: vaga.etapas.length === 0,
      ajustesCompartilhados: [],
      enviadaEm: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, COLECOES.candidaturas), registro);
    return { ...registro, id: ref.id };
  });
}

async function candidaturaAberta(id: string) {
  await garantirCandidatoAnonimo();
  const { db } = candidatoClient();
  const ref = doc(db, COLECOES.candidaturas, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new ServiceError("Não encontramos sua candidatura. Abra o link da vaga novamente.");
  if (snap.data().avaliacaoConcluida) throw new ServiceError("Esta avaliação já foi enviada.");
  return ref;
}

export async function salvarRespostas(
  candidaturaId: string,
  respostas: Record<string, string>,
  concluir: boolean
): Promise<void> {
  return executar(async () => {
    const ref = await candidaturaAberta(candidaturaId);
    await updateDoc(ref, { respostas, avaliacaoConcluida: concluir });
  });
}

/** Guarda só os ajustes que o candidato escolheu mostrar à empresa (nunca a condição). */
export async function compartilharAjustes(candidaturaId: string, ajustes: string[]): Promise<void> {
  return executar(async () => {
    const ref = await candidaturaAberta(candidaturaId);
    await updateDoc(ref, { ajustesCompartilhados: ajustes });
  });
}
