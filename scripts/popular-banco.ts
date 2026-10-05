/**
 * Cria o banco real (Cloud Firestore) com os mesmos dados de exemplo do modo
 * demonstração (src/data/seed.ts): a empresa, as vagas com etapas e perguntas
 * e as candidaturas com respostas.
 *
 * O script usa o mesmo SDK do site, com uma conta comum de empresa e candidatos
 * anônimos. Por isso, passa pelas mesmas regras de segurança (firestore.rules)
 * e não precisa de chave de administrador.
 *
 * Uso: npm run db:popular (veja "Popular o banco com dados de exemplo" no README).
 */
import { deleteApp, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
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
  updateDoc,
  where,
} from "firebase/firestore";

import { DEMO_LOGIN, seedCandidaturas, seedEmpresas, seedVagas } from "../src/data/seed.ts";

const COLECOES = { empresas: "empresas", vagas: "vagas", candidaturas: "candidaturas" } as const;

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sem .env.local: usa só as variáveis definidas no terminal
}

// O comando "firebase emulators:exec" define estas variáveis
const authEmulador = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreEmulador = process.env.FIRESTORE_EMULATOR_HOST;
const usarEmulador = Boolean(authEmulador && firestoreEmulador);

const config: FirebaseOptions = usarEmulador
  ? { apiKey: "emulador", appId: "emulador", projectId: process.env.GCLOUD_PROJECT ?? "demo-neurowork" }
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

// No emulador (banco descartável, só no computador) pode usar a conta de demonstração.
// No Firebase real, a senha vem do .env.local e nunca do código.
const email = process.env.SEED_EMPRESA_EMAIL || (usarEmulador ? DEMO_LOGIN.email : "");
const senha = process.env.SEED_EMPRESA_SENHA || (usarEmulador ? DEMO_LOGIN.senha : "");

class ErroDoScript extends Error {}

const MENSAGENS: Record<string, string> = {
  "auth/email-already-in-use": "Este e-mail já tem conta no Firebase, mas a senha do .env.local está incorreta.",
  "auth/operation-not-allowed": "Ative os métodos de login E-mail/senha e Anônimo em Authentication → Método de login.",
  "auth/admin-restricted-operation": "Ative o método de login Anônimo em Authentication → Método de login.",
  "auth/weak-password": "A senha precisa ter pelo menos 8 caracteres, com letras e números.",
  "auth/network-request-failed": "Sem conexão com o Firebase. Verifique a internet.",
  "permission-denied":
    "O Firestore recusou a gravação. Publique as regras do arquivo firestore.rules antes de rodar o script.",
  "not-found": "O banco Firestore ainda não foi criado neste projeto (Firestore Database → Criar banco de dados).",
};

function codigoDoErro(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code).replace(/^firestore\//, "");
  }
  return "";
}

function conectar(nome: string) {
  const app = initializeApp(config, nome);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (usarEmulador) {
    connectAuthEmulator(auth, `http://${authEmulador}`, { disableWarnings: true });
    const [host, porta] = firestoreEmulador!.split(":");
    connectFirestoreEmulator(db, host, Number(porta));
  }
  return { app, auth, db };
}

/** Entra com a conta da empresa ou, se ela ainda não existir, cria a conta. */
async function entrarComoEmpresa(auth: Auth): Promise<string> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, senha);
    console.log(`✓ Entrou com a conta ${email}`);
    return user.uid;
  } catch (error) {
    const codigo = codigoDoErro(error);
    if (codigo !== "auth/invalid-credential" && codigo !== "auth/user-not-found") throw error;
    const { user } = await createUserWithEmailAndPassword(auth, email, senha);
    console.log(`✓ Conta da empresa criada: ${email}`);
    return user.uid;
  }
}

/** Mesmo formato do link criado pelo site: título + 4 caracteres aleatórios. */
function novoSlug(slugDeExemplo: string) {
  return `${slugDeExemplo.replace(/-[a-z0-9]{4}$/, "")}-${Math.random().toString(36).slice(2, 6)}`;
}

async function popular(empresaApp: ReturnType<typeof conectar>, candidatoApp: ReturnType<typeof conectar>) {
  const { auth, db } = empresaApp;
  const uid = await entrarComoEmpresa(auth);

  // 1. Empresa: o id do documento é o mesmo id do usuário no Authentication
  const empresaRef = doc(db, COLECOES.empresas, uid);
  const empresaExistente = await getDoc(empresaRef);
  const exemplo = seedEmpresas[0];
  let nomeEmpresa = exemplo.nome;

  if (empresaExistente.exists()) {
    nomeEmpresa = String(empresaExistente.data().nome);
    console.log(`✓ Empresa já cadastrada: ${nomeEmpresa}`);
  } else {
    // A regra exige que a conta nasça sem plano; a contratação (simulada) vem depois, como no site
    await setDoc(empresaRef, {
      nome: exemplo.nome,
      cnpj: exemplo.cnpj,
      email,
      telefone: exemplo.telefone,
      responsavel: exemplo.responsavel,
      plano: null,
      criadaEm: new Date().toISOString(),
    });
    await updateDoc(empresaRef, { plano: exemplo.plano });
    console.log(`✓ Empresa cadastrada: ${exemplo.nome} (plano ${exemplo.plano}, contratação simulada)`);
  }

  const vagasExistentes = await getDocs(query(collection(db, COLECOES.vagas), where("empresaId", "==", uid)));
  if (!vagasExistentes.empty) {
    throw new ErroDoScript(
      `A empresa já tem ${vagasExistentes.size} vaga(s) no banco. O script parou para não duplicar os dados.`
    );
  }

  // 2. Vagas: nascem abertas e sem etapas (regra de criação); depois recebem o processo seletivo
  const idsDasVagas = new Map<string, string>();
  const slugs: { titulo: string; slug: string; status: string }[] = [];

  for (const vaga of seedVagas) {
    const { id: idDeExemplo, etapas, status, slug, ...dados } = vaga;
    const novo = novoSlug(slug);
    const ref = await addDoc(collection(db, COLECOES.vagas), {
      ...dados,
      empresaId: uid,
      empresaNome: nomeEmpresa,
      slug: novo,
      status: "aberta",
      etapas: [],
    });
    if (etapas.length > 0) await updateDoc(ref, { etapas });
    idsDasVagas.set(idDeExemplo, ref.id);
    slugs.push({ titulo: vaga.titulo, slug: novo, status });
  }
  console.log(`✓ ${seedVagas.length} vagas criadas, com etapas e perguntas`);

  // 3. Candidaturas: cada candidato entra de forma anônima, como pelo link da vaga
  for (const candidatura of seedCandidaturas) {
    const {
      id: _idDeExemplo,
      vagaId,
      empresaId: _empresaId,
      status,
      respostas,
      avaliacaoConcluida,
      ajustesCompartilhados,
      ...dados
    } = candidatura;

    await signOut(candidatoApp.auth);
    const { user } = await signInAnonymously(candidatoApp.auth);

    const ref = await addDoc(collection(candidatoApp.db, COLECOES.candidaturas), {
      ...dados,
      vagaId: idsDasVagas.get(vagaId),
      empresaId: uid,
      candidatoUid: user.uid,
      status: "nova",
      respostas: {},
      avaliacaoConcluida: false,
      ajustesCompartilhados: [],
    });

    // O candidato responde à avaliação e decide quais ajustes mostrar à empresa
    await updateDoc(ref, { respostas, ajustesCompartilhados, avaliacaoConcluida });

    // A empresa analisa e altera o status
    if (status !== "nova") await updateDoc(doc(db, COLECOES.candidaturas, ref.id), { status });
  }
  await signOut(candidatoApp.auth);
  console.log(`✓ ${seedCandidaturas.length} candidaturas enviadas por candidatos anônimos`);

  // 4. Vagas encerradas só são fechadas no fim, porque candidaturas só entram em vaga aberta
  for (const vaga of seedVagas.filter((v) => v.status === "encerrada")) {
    await updateDoc(doc(db, COLECOES.vagas, idsDasVagas.get(vaga.id)!), { status: "encerrada" });
  }

  console.log("\nBanco pronto. Links das vagas (abra com o site rodando):");
  for (const { titulo, slug, status } of slugs) {
    console.log(`  • ${titulo}: /vaga/${slug}${status === "encerrada" ? " (encerrada)" : ""}`);
  }
  const origemDaSenha = usarEmulador && !process.env.SEED_EMPRESA_SENHA ? "da conta de demonstração" : "do .env.local";
  console.log(`\nEntre no painel com o e-mail ${email} e a senha ${origemDaSenha}.`);
}

async function main() {
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new ErroDoScript("Preencha as chaves NEXT_PUBLIC_FIREBASE_* no arquivo .env.local (veja o .env.example).");
  }
  if (!email || !senha) {
    throw new ErroDoScript("Preencha SEED_EMPRESA_EMAIL e SEED_EMPRESA_SENHA no arquivo .env.local.");
  }

  console.log(`Projeto: ${config.projectId}${usarEmulador ? " (emulador local)" : ""}\n`);

  // Duas instâncias, como no site: a da empresa e a do candidato anônimo
  const empresaApp = conectar("empresa");
  const candidatoApp = conectar("candidato");
  const apps: FirebaseApp[] = [empresaApp.app, candidatoApp.app];

  try {
    await popular(empresaApp, candidatoApp);
  } finally {
    await Promise.all(apps.map((app) => deleteApp(app)));
  }
}

main().catch((error: unknown) => {
  const mensagem =
    error instanceof ErroDoScript
      ? error.message
      : (MENSAGENS[codigoDoErro(error)] ?? `Erro inesperado: ${error instanceof Error ? error.message : error}`);
  console.error(`\n✗ ${mensagem}`);
  process.exitCode = 1;
});
