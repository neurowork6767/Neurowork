import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

/**
 * Configuração do Firebase lida do arquivo .env.local (veja .env.example).
 *
 * Estas chaves identificam o projeto e podem ficar no navegador: quem protege os
 * dados são as regras de segurança do Firestore (firestore.rules), não o sigilo da chave.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Sem as chaves no .env.local, o sistema roda no modo demonstração (dados no navegador). */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

function getOrCreateApp(name: string): FirebaseApp {
  return getApps().find((app) => app.name === name) ?? initializeApp(firebaseConfig, name);
}

/** App usado pelas empresas (login com e-mail e senha). */
export function getEmpresaApp() {
  return getOrCreateApp("[DEFAULT]");
}

/**
 * App separado para o candidato, que entra de forma anônima (sem criar conta).
 * Por ser outra instância, o login anônimo não desconecta uma empresa logada
 * no mesmo navegador — útil ao testar os dois lados em abas diferentes.
 */
export function getCandidatoApp() {
  return getOrCreateApp("candidato");
}
