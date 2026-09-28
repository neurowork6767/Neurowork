import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import type { Candidatura, Vaga } from "@/types";
import { montarRelatorio, ServiceError, type RelatorioVaga } from "../shared";
import { COLECOES, empresaClient, executar, requireEmpresaUid } from "./client";
import { comId } from "./mappers";

export async function gerarRelatorioVaga(vagaId: string): Promise<RelatorioVaga> {
  return executar(async () => {
    const uid = await requireEmpresaUid();
    const { db } = empresaClient();
    const vagaSnap = await getDoc(doc(db, COLECOES.vagas, vagaId));
    if (!vagaSnap.exists() || vagaSnap.data().empresaId !== uid) throw new ServiceError("Vaga não encontrada.");

    const candidaturas = await getDocs(
      query(collection(db, COLECOES.candidaturas), where("empresaId", "==", uid), where("vagaId", "==", vagaId))
    );
    return montarRelatorio(
      comId<Vaga>(vagaSnap),
      candidaturas.docs.map((d) => comId<Candidatura>(d))
    );
  });
}
