import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import type { Empresa, Sessao } from "@/types";
import { ServiceError, type CadastroEmpresaInput } from "../shared";
import { COLECOES, empresaClient, executar } from "./client";

async function sessaoDe(uid: string, email: string): Promise<Sessao> {
  const { db } = empresaClient();
  const snap = await getDoc(doc(db, COLECOES.empresas, uid));
  if (!snap.exists()) throw new ServiceError("Conta sem cadastro de empresa. Faça o cadastro novamente.");
  return { empresaId: uid, nome: String(snap.data().nome), email };
}

export async function login(email: string, senha: string): Promise<Sessao> {
  return executar(async () => {
    const { auth } = empresaClient();
    const { user } = await signInWithEmailAndPassword(auth, email, senha);
    return sessaoDe(user.uid, user.email ?? email);
  });
}

/**
 * Cria o usuário no Firebase Authentication e o documento da empresa no Firestore.
 * A senha fica só no Authentication: nunca é gravada no banco.
 */
export async function cadastrarEmpresa(input: CadastroEmpresaInput): Promise<Sessao> {
  return executar(async () => {
    const { auth, db } = empresaClient();
    const { user } = await createUserWithEmailAndPassword(auth, input.email, input.senha);

    const empresa: Omit<Empresa, "id"> = {
      nome: input.nome,
      cnpj: input.cnpj,
      email: input.email,
      telefone: input.telefone,
      responsavel: input.responsavel,
      plano: null,
      criadaEm: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, COLECOES.empresas, user.uid), empresa);
    } catch (error) {
      // Sem o documento da empresa a conta ficaria inutilizável: desfaz a criação do usuário
      await user.delete();
      throw error;
    }

    return { empresaId: user.uid, nome: empresa.nome, email: empresa.email };
  });
}

export async function recuperarSenha(email: string): Promise<void> {
  return executar(async () => {
    try {
      await sendPasswordResetEmail(empresaClient().auth, email);
    } catch (error) {
      // Não revela se o e-mail tem conta ou não
      if (error instanceof Error && "code" in error && error.code === "auth/user-not-found") return;
      throw error;
    }
  });
}

export async function logout(): Promise<void> {
  return executar(() => signOut(empresaClient().auth));
}

/** Avisa sempre que a empresa entra ou sai. Devolve a função para parar de observar. */
export function observarSessao(callback: (sessao: Sessao | null) => void): () => void {
  const { auth } = empresaClient();
  return onAuthStateChanged(auth, (user) => {
    if (!user || user.isAnonymous) {
      callback(null);
      return;
    }
    sessaoDe(user.uid, user.email ?? "")
      .then(callback)
      .catch(() => callback(null));
  });
}
