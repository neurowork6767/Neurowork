import { CANDIDATURA_STATUS_LABEL } from "@/lib/constants";
import type { CandidaturaStatus } from "@/types";
import { delay, readDb, requireSession, ServiceError } from "./storage";

export type RelatorioVaga = {
  vagaId: string;
  vagaTitulo: string;
  totalCandidatos: number;
  porStatus: { status: CandidaturaStatus; label: string; quantidade: number }[];
  avaliacoesConcluidas: number;
  taxaConclusao: number;
};

export async function gerarRelatorioVaga(vagaId: string): Promise<RelatorioVaga> {
  await delay(600);
  const { empresaId } = requireSession();
  const db = readDb();
  const vaga = db.vagas.find((v) => v.id === vagaId && v.empresaId === empresaId);
  if (!vaga) throw new ServiceError("Vaga não encontrada.");

  const candidaturas = db.candidaturas.filter((c) => c.vagaId === vagaId);
  const concluidas = candidaturas.filter((c) => c.avaliacaoConcluida).length;
  const statuses = Object.keys(CANDIDATURA_STATUS_LABEL) as CandidaturaStatus[];

  return {
    vagaId,
    vagaTitulo: vaga.titulo,
    totalCandidatos: candidaturas.length,
    porStatus: statuses.map((status) => ({
      status,
      label: CANDIDATURA_STATUS_LABEL[status],
      quantidade: candidaturas.filter((c) => c.status === status).length,
    })),
    avaliacoesConcluidas: concluidas,
    taxaConclusao: candidaturas.length ? Math.round((concluidas / candidaturas.length) * 100) : 0,
  };
}
