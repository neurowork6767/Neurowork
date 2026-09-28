/**
 * Ajustes da avaliação que o candidato pode ligar antes de começar.
 *
 * As perguntas são as mesmas para todos; os ajustes mudam apenas a forma de apresentar
 * e de responder. A condição escolhida no atalho (TEA, TDAH, dislexia) serve só para
 * sugerir ajustes: ela não é salva em lugar nenhum nem enviada à empresa.
 */

export type AjusteId =
  | "uma_por_tela"
  | "pausa"
  | "passo_a_passo"
  | "texto_maior"
  | "ler_em_voz_alta"
  | "responder_falando";

export type Ajuste = {
  id: AjusteId;
  label: string;
  descricao: string;
};

export const AJUSTES: Ajuste[] = [
  { id: "uma_por_tela", label: "Uma pergunta por tela", descricao: "Menos informação ao mesmo tempo." },
  { id: "pausa", label: "Botão de pausa", descricao: "Pare quando quiser. As respostas ficam salvas." },
  {
    id: "passo_a_passo",
    label: "Pergunta explicada passo a passo",
    descricao: "Mostra o que a empresa quer saber, um exemplo e quantas perguntas faltam.",
  },
  { id: "texto_maior", label: "Texto maior e mais espaçado", descricao: "Letras maiores, mais espaço e fundo creme." },
  { id: "ler_em_voz_alta", label: "Ler as perguntas em voz alta", descricao: "Cada pergunta é lida quando aparece." },
  {
    id: "responder_falando",
    label: "Responder falando",
    descricao: "Você fala e o texto é escrito para você. Depende do navegador.",
  },
];

export const AJUSTE_LABEL: Record<string, string> = Object.fromEntries(AJUSTES.map((a) => [a.id, a.label]));

export type AtalhoId = "tea" | "tdah" | "dislexia" | "manual";

/** Atalhos: sugestões comuns, não regras. Cada pessoa é diferente e pode mudar tudo. */
export const ATALHOS: { id: AtalhoId; label: string; sugestao: AjusteId[] }[] = [
  { id: "tea", label: "Autismo (TEA)", sugestao: ["passo_a_passo", "uma_por_tela"] },
  { id: "tdah", label: "TDAH", sugestao: ["uma_por_tela", "pausa"] },
  { id: "dislexia", label: "Dislexia", sugestao: ["texto_maior", "ler_em_voz_alta", "responder_falando"] },
  { id: "manual", label: "Prefiro escolher sozinho(a)", sugestao: [] },
];

export function isAjusteId(valor: string): valor is AjusteId {
  return AJUSTES.some((a) => a.id === valor);
}
