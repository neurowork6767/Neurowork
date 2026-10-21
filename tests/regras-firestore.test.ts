/**
 * Testes das regras de segurança do banco (firestore.rules), no emulador do Firebase.
 *
 * Cada teste tenta fazer uma operação direto no banco, sem passar pelas telas,
 * como faria alguém que alterasse o código do site. O que não é permitido
 * precisa ser recusado pelo servidor ("permission-denied").
 *
 * Rodar: npm run test:regras (precisa do Java 21 ou mais novo)
 */
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInAnonymously,
  type Auth,
} from "firebase/auth";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";

const AUTH_EMULADOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULADOR = process.env.FIRESTORE_EMULATOR_HOST;
const PROJETO = process.env.GCLOUD_PROJECT ?? "demo-neurowork";
const SEM_EMULADOR = !AUTH_EMULADOR || !FIRESTORE_EMULADOR;

type Cliente = { app: FirebaseApp; auth: Auth; db: Firestore };
const clientes: Cliente[] = [];

function conectar(nome: string): Cliente {
  const app = initializeApp({ apiKey: "emulador", appId: "emulador", projectId: PROJETO }, nome);
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, `http://${AUTH_EMULADOR}`, { disableWarnings: true });
  const [host, porta] = FIRESTORE_EMULADOR!.split(":");
  connectFirestoreEmulator(db, host, Number(porta));
  const cliente = { app, auth, db };
  clientes.push(cliente);
  return cliente;
}

/** Espera que o banco recuse a operação. */
async function bloqueado(operacao: Promise<unknown>) {
  await assert.rejects(operacao, (erro: { code?: string }) => {
    assert.equal(erro.code, "permission-denied");
    return true;
  });
}

/** Cria a conta e o cadastro de uma empresa, como faz a tela de cadastro. */
async function criarEmpresa(cliente: Cliente, nome: string, email: string) {
  const { user } = await createUserWithEmailAndPassword(cliente.auth, email, "senha1234");
  await setDoc(doc(cliente.db, "empresas", user.uid), {
    nome,
    cnpj: "11.444.777/0001-61",
    email,
    telefone: "(47) 99999-0000",
    responsavel: "Pessoa Responsável",
    plano: null,
    criadaEm: new Date().toISOString(),
  });
  return user.uid;
}

/** Cria uma vaga como faz o site: aberta e sem etapas; depois pode ser encerrada. */
async function criarVaga(cliente: Cliente, empresaId: string, status: "aberta" | "encerrada") {
  const ref = await addDoc(collection(cliente.db, "vagas"), {
    empresaId,
    empresaNome: "Empresa A",
    slug: `vaga-${status}-${Math.random().toString(36).slice(2, 6)}`,
    titulo: `Vaga ${status}`,
    descricao: "",
    requisitos: "",
    modalidade: "remoto",
    local: "",
    faixaSalarial: "",
    adaptacoes: [],
    status: "aberta",
    etapas: [],
    criadaEm: new Date().toISOString(),
  });
  if (status === "encerrada") await updateDoc(ref, { status: "encerrada" });
  return ref.id;
}

describe("Regras de segurança do Firestore", { skip: SEM_EMULADOR && "rode com npm run test:regras" }, () => {
  let empresaA: Cliente;
  let empresaB: Cliente;
  let candidato: Cliente;
  let idEmpresaA: string;
  let vagaAberta: string;
  let vagaEncerrada: string;
  let candidaturaValida: string;

  /** Candidatura com exatamente os campos que o site envia. */
  function candidatura(extra: Record<string, unknown> = {}) {
    return {
      vagaId: vagaAberta,
      empresaId: idEmpresaA,
      candidatoUid: candidato.auth.currentUser!.uid,
      nome: "Lucas Almeida",
      email: "lucas@email.com",
      telefone: "(47) 98888-7777",
      cidade: "Blumenau – SC",
      curriculo: { nome: "curriculo.pdf", tamanho: 120000 },
      portfolio: null,
      certificados: [],
      portfolioLink: "",
      adaptacoes: "",
      consentimentoLgpd: true,
      status: "nova",
      respostas: {},
      avaliacaoConcluida: false,
      ajustesCompartilhados: [],
      enviadaEm: new Date().toISOString(),
      ...extra,
    };
  }

  before(async () => {
    // As recusas são esperadas; sem isto o SDK escreve cada uma no terminal
    setLogLevel("silent");

    // Começa com o emulador vazio
    await fetch(`http://${FIRESTORE_EMULADOR}/emulator/v1/projects/${PROJETO}/databases/(default)/documents`, {
      method: "DELETE",
    });
    await fetch(`http://${AUTH_EMULADOR}/emulator/v1/projects/${PROJETO}/accounts`, { method: "DELETE" });

    empresaA = conectar("empresa-a");
    empresaB = conectar("empresa-b");
    candidato = conectar("candidato");

    idEmpresaA = await criarEmpresa(empresaA, "Empresa A", "rh@empresa-a.com");
    await criarEmpresa(empresaB, "Empresa B", "rh@empresa-b.com");
    vagaAberta = await criarVaga(empresaA, idEmpresaA, "aberta");
    vagaEncerrada = await criarVaga(empresaA, idEmpresaA, "encerrada");
    await signInAnonymously(candidato.auth);
  });

  after(async () => {
    await Promise.all(clientes.map((c) => deleteApp(c.app)));
  });

  describe("Candidato (acesso anônimo, sem conta)", () => {
    test("envia uma candidatura válida em vaga aberta", async () => {
      const ref = await addDoc(collection(candidato.db, "candidaturas"), candidatura());
      candidaturaValida = ref.id;
    });

    test("não grava campo extra, como um diagnóstico", async () => {
      await bloqueado(addDoc(collection(candidato.db, "candidaturas"), candidatura({ diagnostico: "TEA" })));
    });

    test("não envia sem o aceite da LGPD", async () => {
      await bloqueado(addDoc(collection(candidato.db, "candidaturas"), candidatura({ consentimentoLgpd: false })));
    });

    test("não cria a candidatura já aprovada", async () => {
      await bloqueado(addDoc(collection(candidato.db, "candidaturas"), candidatura({ status: "aprovado" })));
    });

    test("não se candidata a vaga encerrada", async () => {
      await bloqueado(addDoc(collection(candidato.db, "candidaturas"), candidatura({ vagaId: vagaEncerrada })));
    });

    test("não muda o status da própria candidatura", async () => {
      await bloqueado(updateDoc(doc(candidato.db, "candidaturas", candidaturaValida), { status: "aprovado" }));
    });

    test("não lê as candidaturas da empresa", async () => {
      await bloqueado(getDocs(query(collection(candidato.db, "candidaturas"), where("empresaId", "==", idEmpresaA))));
    });

    test("não cria vagas", async () => {
      await bloqueado(
        addDoc(collection(candidato.db, "vagas"), {
          empresaId: candidato.auth.currentUser!.uid,
          status: "aberta",
          titulo: "Vaga falsa",
          etapas: [],
        })
      );
    });
  });

  describe("Isolamento entre empresas", () => {
    test("uma empresa não lê as candidaturas de outra", async () => {
      await bloqueado(getDocs(query(collection(empresaB.db, "candidaturas"), where("empresaId", "==", idEmpresaA))));
    });

    test("uma empresa não lê o cadastro de outra", async () => {
      await bloqueado(getDoc(doc(empresaB.db, "empresas", idEmpresaA)));
    });

    test("uma empresa não altera a vaga de outra", async () => {
      await bloqueado(updateDoc(doc(empresaB.db, "vagas", vagaAberta), { titulo: "Alterada" }));
    });
  });

  describe("Empresa dona dos dados", () => {
    test("altera o status da candidatura", async () => {
      await updateDoc(doc(empresaA.db, "candidaturas", candidaturaValida), { status: "em_analise" });
      const salva = await getDoc(doc(empresaA.db, "candidaturas", candidaturaValida));
      assert.equal(salva.data()?.status, "em_analise");
    });

    test("não altera as respostas do candidato", async () => {
      await bloqueado(
        updateDoc(doc(empresaA.db, "candidaturas", candidaturaValida), { respostas: { pergunta: "outra" } })
      );
    });

    test("não altera o próprio CNPJ", async () => {
      await bloqueado(updateDoc(doc(empresaA.db, "empresas", idEmpresaA), { cnpj: "45.723.174/0001-10" }));
    });
  });
});
