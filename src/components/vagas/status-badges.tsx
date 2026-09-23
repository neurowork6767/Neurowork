import { Badge } from "@/components/ui/badge";
import { CANDIDATURA_STATUS_LABEL, VAGA_STATUS_LABEL } from "@/lib/constants";
import type { CandidaturaStatus, VagaStatus } from "@/types";

const CANDIDATURA_VARIANT = {
  nova: "info",
  em_analise: "warning",
  aprovado: "success",
  reprovado: "destructive",
} as const;

/** O status sempre aparece como texto, não só pela cor. */
export function CandidaturaStatusBadge({ status }: { status: CandidaturaStatus }) {
  return <Badge variant={CANDIDATURA_VARIANT[status]}>{CANDIDATURA_STATUS_LABEL[status]}</Badge>;
}

export function VagaStatusBadge({ status }: { status: VagaStatus }) {
  return <Badge variant={status === "aberta" ? "success" : "outline"}>{VAGA_STATUS_LABEL[status]}</Badge>;
}
