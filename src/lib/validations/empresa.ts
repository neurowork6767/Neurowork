import type * as yup from "yup";

import { cadastroSchema } from "./auth";

/** Dados editáveis da empresa: reaproveita as mesmas regras do cadastro. */
export const empresaSchema = cadastroSchema.pick(["nome", "responsavel", "telefone"]);

export type EmpresaFormValues = yup.InferType<typeof empresaSchema>;
