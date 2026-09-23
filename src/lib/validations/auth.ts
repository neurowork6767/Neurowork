import * as yup from "yup";

import { isValidCnpj, onlyDigits } from "@/lib/masks";

export const loginSchema = yup.object({
  email: yup.string().trim().required("Informe o e-mail.").email("Digite um e-mail válido, como nome@empresa.com.br."),
  senha: yup.string().required("Informe a senha."),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const cadastroSchema = yup.object({
  nome: yup.string().trim().required("Informe o nome da empresa.").min(2, "O nome precisa ter pelo menos 2 letras."),
  cnpj: yup
    .string()
    .required("Informe o CNPJ.")
    .test("cnpj-completo", "O CNPJ precisa ter 14 números.", (value) => onlyDigits(value ?? "").length === 14)
    .test("cnpj-valido", "Este CNPJ não é válido. Confira os números.", (value) => isValidCnpj(value ?? "")),
  responsavel: yup.string().trim().required("Informe o nome da pessoa responsável."),
  email: yup.string().trim().required("Informe o e-mail.").email("Digite um e-mail válido, como nome@empresa.com.br."),
  telefone: yup
    .string()
    .required("Informe o telefone.")
    .test("telefone", "Digite o telefone com DDD, como (11) 91234-5678.", (value) => {
      const length = onlyDigits(value ?? "").length;
      return length === 10 || length === 11;
    }),
  senha: yup
    .string()
    .required("Crie uma senha.")
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .matches(/[A-Za-z]/, "A senha precisa ter pelo menos uma letra.")
    .matches(/\d/, "A senha precisa ter pelo menos um número."),
  confirmarSenha: yup
    .string()
    .required("Repita a senha.")
    .oneOf([yup.ref("senha")], "As senhas não são iguais."),
});

export type CadastroValues = yup.InferType<typeof cadastroSchema>;

export const recuperarSenhaSchema = yup.object({
  email: yup.string().trim().required("Informe o e-mail.").email("Digite um e-mail válido, como nome@empresa.com.br."),
});

export type RecuperarSenhaValues = yup.InferType<typeof recuperarSenhaSchema>;
