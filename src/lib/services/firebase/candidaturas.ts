import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import type { Candidatura, CandidaturaStatus, NovaCandidatura, Vaga } from "@/types";
import {
  comTituloDaVaga,
  idsDosArquivos,
  prepararArquivos,
  ServiceError,
  type ArquivoConteudo,
  type CandidaturaComVaga,
  type CandidaturaDetalhe,
} from "../shared";
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

/** A empresa abre um PDF enviado pelo candidato. */
export async function obterArquivo(candidaturaId: string, arquivoId: string): Promise<ArquivoConteudo> {
  return executar(async () => {
    await requireEmpresaUid();
    const { db } = empresaClient();
    const snap = await getDoc(doc(db, COLECOES.candidaturas, candidaturaId, COLECOES.arquivos, arquivoId));
    if (!snap.exists()) throw new ServiceError("Arquivo não encontrado.");
    return { nome: String(snap.data().nome), conteudo: String(snap.data().conteudo) };
  });
}

/** Exclui a candidatura e todos os dados do candidato, PDFs incluídos (direito de exclusão da LGPD). */
export async function excluirCandidatura(id: string): Promise<void> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const ref = doc(db, COLECOES.candidaturas, id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().empresaId !== uid) throw new ServiceError("Candidatura não encontrada.");
    await excluirComArquivos(ref, comId<Candidatura>(snap));
  });
}

/** Apaga os PDFs e a candidatura de uma vez só: ou tudo é apagado, ou nada. */
async function excluirComArquivos(ref: DocumentReference, candidatura: Candidatura) {
  const lote = writeBatch(ref.firestore);
  for (const arquivoId of idsDosArquivos(candidatura)) lote.delete(doc(ref, COLECOES.arquivos, arquivoId));
  lote.delete(ref);
  await lote.commit();
}

/* ---------- Operações do candidato (login anônimo, sem conta) ---------- */

/** O próprio candidato apaga a candidatura que enviou (a regra confere que ela é dele). */
export async function excluirMinhaCandidatura(candidaturaId: string): Promise<void> {
  return executar(async () => {
    await garantirCandidatoAnonimo();
    const { db } = candidatoClient();
    const ref = doc(db, COLECOES.candidaturas, candidaturaId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new ServiceError("Candidatura não encontrada. Ela pode já ter sido excluída.");
    await excluirComArquivos(ref, comId<Candidatura>(snap));
  });
}

export async function enviarCandidatura(vagaId: string, dados: NovaCandidatura): Promise<Candidatura> {
  return executar(async () => {
    if (!dados.consentimentoLgpd) throw new ServiceError("É preciso aceitar o uso dos dados para continuar.");
    const candidatoUid = await garantirCandidatoAnonimo();
    const { db } = candidatoClient();

    const vagaSnap = await getDoc(doc(db, COLECOES.vagas, vagaId));
    if (!vagaSnap.exists()) throw new ServiceError("Esta vaga não está recebendo candidaturas.");
    const vaga = comId<Vaga>(vagaSnap);

    // O id da candidatura e dos PDFs é criado antes, para gravar tudo num único envio
    const ref = doc(collection(db, COLECOES.candidaturas));
    const arquivos = prepararArquivos(dados, () => doc(collection(ref, COLECOES.arquivos)).id);

    const registro: Omit<Candidatura, "id"> & { candidatoUid: string } = {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      cidade: dados.cidade,
      curriculo: arquivos.curriculo,
      portfolio: arquivos.portfolio,
      certificados: arquivos.certificados,
      portfolioLink: dados.portfolioLink,
      adaptacoes: dados.adaptacoes,
      consentimentoLgpd: dados.consentimentoLgpd,
      vagaId,
      empresaId: vaga.empresaId,
      candidatoUid,
      status: "nova",
      respostas: {},
      avaliacaoConcluida: vaga.etapas.length === 0,
      ajustesCompartilhados: [],
      enviadaEm: new Date().toISOString(),
    };
    const lote = writeBatch(db);
    lote.set(ref, registro);
    for (const arquivo of arquivos.guardados) {
      lote.set(doc(ref, COLECOES.arquivos, arquivo.id), {
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        tamanho: arquivo.tamanho,
        conteudo: arquivo.conteudo,
        enviadoEm: registro.enviadaEm,
      });
    }
    await lote.commit();
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
