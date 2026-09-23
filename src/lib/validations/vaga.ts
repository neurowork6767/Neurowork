import * as yup from "yup";

import type { Modalidade } from "@/types";

export const vagaSchema = yup.object({
  titulo: yup.string().trim().required("Informe o cargo.").max(80, "Use no máximo 80 caracteres."),
  descricao: yup
    .string()
    .trim()
    .required("Descreva a vaga.")
    .min(20, "Escreva pelo menos 20 caracteres para o candidato entender a vaga."),
  requisitos: yup.string().trim().required("Informe os requisitos."),
  modalidade: yup
    .mixed<Modalidade>()
    .oneOf(["presencial", "hibrido", "remoto"], "Escolha a modalidade.")
    .required("Escolha a modalidade."),
  local: yup.string().trim().required("Informe o local de trabalho."),
  faixaSalarial: yup.string().default(""),
  adaptacoes: yup.array().of(yup.string().required()).min(1, "Escolha pelo menos uma adaptação oferecida.").required(),
});

export type VagaFormValues = yup.InferType<typeof vagaSchema>;
