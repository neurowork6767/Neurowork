import * as yup from "yup";

import type { Etapa } from "@/types";

const perguntaSchema = yup.object({
  enunciado: yup.string().trim().required("Escreva a pergunta."),
  tipo: yup.string().oneOf(["dissertativa", "multipla_escolha"]).required(),
  orientacao: yup.string().max(600, "Use no máximo 600 caracteres."),
  exemplo: yup.string().max(600, "Use no máximo 600 caracteres."),
  opcoes: yup
    .array()
    .of(yup.string().trim().required("Preencha ou remova esta opção."))
    .when("tipo", {
      is: "multipla_escolha",
      then: (schema) => schema.min(2, "Adicione pelo menos 2 opções."),
    }),
});

const etapaSchema = yup.object({
  titulo: yup.string().trim().required("Dê um título para a etapa."),
  instrucoes: yup.string().trim().max(400, "Use no máximo 400 caracteres."),
  perguntas: yup.array().of(perguntaSchema).min(1, "Adicione pelo menos uma pergunta."),
});

export const processoSchema = yup.object({
  etapas: yup.array().of(etapaSchema),
});

/**
 * Valida as etapas e devolve os erros indexados pelo caminho do campo,
 * ex.: "etapas[0].perguntas[1].enunciado".
 */
export async function validarProcesso(etapas: Etapa[]): Promise<Record<string, string>> {
  try {
    await processoSchema.validate({ etapas }, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) throw error;
    const errors: Record<string, string> = {};
    for (const item of error.inner) {
      if (item.path && !errors[item.path]) errors[item.path] = item.message;
    }
    return errors;
  }
}
