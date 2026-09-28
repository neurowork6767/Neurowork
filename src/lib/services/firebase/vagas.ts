import { addDoc, collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";

import { slugify } from "@/lib/utils";
import type { Candidatura, Etapa, Vaga, VagaInput, VagaStatus } from "@/types";
import { comResumo, ServiceError, type VagaComResumo } from "../shared";
import { candidatoClient, COLECOES, empresaClient, executar, requireEmpresaUid } from "./client";
import { comId } from "./mappers";

async function vagaDaEmpresa(id: string, uid: string): Promise<Vaga> {
  const { db } = empresaClient();
  const snap = await getDoc(doc(db, COLECOES.vagas, id));
  if (!snap.exists() || snap.data().empresaId !== uid) throw new ServiceError("Vaga não encontrada.");
  return comId<Vaga>(snap);
}

export async function listarVagas(): Promise<VagaComResumo[]> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const [vagas, candidaturas] = await Promise.all([
      getDocs(query(collection(db, COLECOES.vagas), where("empresaId", "==", uid))),
      getDocs(query(collection(db, COLECOES.candidaturas), where("empresaId", "==", uid))),
    ]);
    return comResumo(
      vagas.docs.map((d) => comId<Vaga>(d)),
      candidaturas.docs.map((d) => comId<Candidatura>(d))
    );
  });
}

export async function obterVaga(id: string): Promise<Vaga> {
  return executar(async () => vagaDaEmpresa(id, await requireEmpresaUid()));
}

/** Página pública do candidato (FE16): a regra de segurança só libera vagas abertas. */
export async function obterVagaPublica(slug: string): Promise<Vaga> {
  return executar(async () => {
    const { db } = candidatoClient();
    const resultado = await getDocs(
      query(collection(db, COLECOES.vagas), where("slug", "==", slug), where("status", "==", "aberta"), limit(1))
    );
    if (resultado.empty) {
      throw new ServiceError("Este link não existe ou a vaga foi encerrada. Confira se ele foi copiado por completo.");
    }
    return comId<Vaga>(resultado.docs[0]);
  });
}

export async function criarVaga(input: VagaInput): Promise<Vaga> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const empresa = await getDoc(doc(db, COLECOES.empresas, uid));

    const dados: Omit<Vaga, "id"> = {
      ...input,
      empresaId: uid,
      empresaNome: String(empresa.data()?.nome ?? ""),
      slug: `${slugify(input.titulo)}-${Math.random().toString(36).slice(2, 6)}`,
      status: "aberta",
      etapas: [],
      criadaEm: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, COLECOES.vagas), dados);
    return { ...dados, id: ref.id };
  });
}

async function atualizar(id: string, dados: Partial<Omit<Vaga, "id" | "empresaId">>): Promise<Vaga> {
  const uid = await requireEmpresaUid();
  const { db } = empresaClient();
  const atual = await vagaDaEmpresa(id, uid);
  await updateDoc(doc(db, COLECOES.vagas, id), dados);
  return { ...atual, ...dados };
}

export async function atualizarVaga(id: string, input: VagaInput): Promise<Vaga> {
  return executar(() => atualizar(id, input));
}

export async function alterarStatusVaga(id: string, status: VagaStatus): Promise<Vaga> {
  return executar(() => atualizar(id, { status }));
}

/** Salva as etapas e perguntas do processo seletivo (FE11). */
export async function salvarEtapas(id: string, etapas: Etapa[]): Promise<Vaga> {
  return executar(() => atualizar(id, { etapas }));
}
