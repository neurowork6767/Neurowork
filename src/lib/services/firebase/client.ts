import { FirebaseError } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getCandidatoApp, getEmpresaApp } from "@/lib/firebase";
import { ServiceError } from "../shared";

export const COLECOES = {
  empresas: "empresas",
  vagas: "vagas",
  candidaturas: "candidaturas",
} as const;

export function empresaClient() {
  const app = getEmpresaApp();
  const auth = getAuth(app);
  auth.languageCode = "pt";
  return { auth, db: getFirestore(app) };
}

export function candidatoClient() {
  const app = getCandidatoApp();
  return { auth: getAuth(app), db: getFirestore(app) };
}

/** Devolve o id da empresa logada ou avisa que a sessão expirou. */
export async function requireEmpresaUid(auth: Auth = empresaClient().auth): Promise<string> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new ServiceError("Sua sessão expirou. Entre novamente.");
  return user.uid;
}

/** O candidato não cria conta: recebe uma identidade anônima só para esta candidatura. */
export async function garantirCandidatoAnonimo(): Promise<string> {
  const { auth } = candidatoClient();
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser.uid;
  const credencial = await signInAnonymously(auth);
  return credencial.user.uid;
}

const MENSAGENS: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/email-already-in-use": "Já existe uma conta com este e-mail.",
  "auth/weak-password": "A senha é fraca. Use pelo menos 8 caracteres, com letras e números.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão com o servidor. Verifique sua internet.",
  "auth/operation-not-allowed": "Este tipo de login não está ativado no Firebase. Veja o README.",
  "auth/admin-restricted-operation": "O login anônimo não está ativado no Firebase. Veja o README.",
  "permission-denied": "Você não tem permissão para fazer isso.",
  unavailable: "Sem conexão com o servidor. Verifique sua internet.",
  "not-found": "Registro não encontrado.",
};

/** Traduz os erros do Firebase para mensagens claras em português. */
export function traduzirErro(error: unknown): Error {
  if (error instanceof ServiceError) return error;
  if (error instanceof FirebaseError) {
    // Erros do Firestore vêm com o código sem prefixo; os do Auth, com "auth/"
    const codigo = error.code.replace(/^firestore\//, "");
    return new ServiceError(MENSAGENS[codigo] ?? "Algo deu errado. Tente novamente.");
  }
  return new ServiceError("Algo deu errado. Tente novamente.");
}

/** Executa a operação e converte qualquer erro do Firebase em ServiceError. */
export async function executar<T>(operacao: () => Promise<T>): Promise<T> {
  try {
    return await operacao();
  } catch (error) {
    throw traduzirErro(error);
  }
}
