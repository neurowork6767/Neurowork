import { montarRelatorio, ServiceError, type RelatorioVaga } from "../shared";
import { delay, readDb, requireSession } from "./storage";

export async function gerarRelatorioVaga(vagaId: string): Promise<RelatorioVaga> {
  await delay(600);
  const { empresaId } = requireSession();
  const db = readDb();
  const vaga = db.vagas.find((v) => v.id === vagaId && v.empresaId === empresaId);
  if (!vaga) throw new ServiceError("Vaga não encontrada.");
  return montarRelatorio(
    vaga,
    db.candidaturas.filter((c) => c.vagaId === vagaId)
  );
}
