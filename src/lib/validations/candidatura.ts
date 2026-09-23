import * as yup from "yup";

import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "@/lib/constants";
import { onlyDigits } from "@/lib/masks";

const pdfFile = (label: string) =>
  yup
    .mixed<File>()
    .test("tipo", `O ${label} precisa ser um arquivo PDF.`, (file) => !file || file.type === "application/pdf")
    .test(
      "tamanho",
      `O ${label} pode ter no máximo ${MAX_FILE_SIZE_MB} MB.`,
      (file) => !file || file.size <= MAX_FILE_SIZE
    );

/**
 * Formulário de candidatura (FE17). Não existe campo de diagnóstico:
 * o candidato só descreve, se quiser, as adaptações que o ajudam.
 */
export const candidaturaSchema = yup.object({
  nome: yup.string().trim().required("Informe seu nome."),
  email: yup.string().trim().required("Informe seu e-mail.").email("Digite um e-mail válido, como nome@email.com."),
  telefone: yup
    .string()
    .required("Informe seu telefone.")
    .test("telefone", "Digite o telefone com DDD, como (11) 91234-5678.", (value) => {
      const length = onlyDigits(value ?? "").length;
      return length === 10 || length === 11;
    }),
  cidade: yup.string().trim().required("Informe sua cidade."),
  curriculo: pdfFile("currículo").required("Anexe seu currículo em PDF."),
  portfolio: pdfFile("portfólio"),
  portfolioLink: yup.string().trim().url("Digite um link completo, começando com https://").default(""),
  adaptacoes: yup.string().trim().max(500, "Use no máximo 500 caracteres.").default(""),
  consentimentoLgpd: yup
    .boolean()
    .required("Para enviar, é preciso aceitar o uso dos seus dados.")
    .test("aceite", "Para enviar, é preciso aceitar o uso dos seus dados.", (value) => value === true),
});

export type CandidaturaFormValues = yup.InferType<typeof candidaturaSchema>;

/** Campos validados em cada etapa do formulário */
export const CAMPOS_POR_ETAPA: (keyof CandidaturaFormValues)[][] = [
  ["nome", "email", "telefone", "cidade"],
  ["curriculo", "portfolio", "portfolioLink", "adaptacoes"],
  ["consentimentoLgpd"],
];
