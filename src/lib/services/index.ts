import { DEMO_LOGIN } from "@/data/seed";
import { isFirebaseConfigured } from "@/lib/firebase";
import * as firebaseImpl from "./firebase";
import * as mockImpl from "./mock";
import { ServiceError, type CadastroEmpresaInput } from "./shared";

/**
 * Camada de serviços (RNF-09): as telas importam dados apenas daqui.
 *
 * - Com as chaves do Firebase no .env.local → usa Firebase Authentication e Firestore.
 * - Sem as chaves → modo demonstração, com dados de exemplo salvos no navegador.
 * - A conta de demonstração (DEMO_LOGIN) usa SEMPRE os dados de exemplo do navegador,
 *   mesmo com o Firebase configurado. Assim ela funciona no site publicado sem
 *   existir no banco, e nada do que é feito nela chega ao Firestore.
 *
 * O tipo abaixo obriga as duas implementações a terem exatamente as mesmas funções,
 * então as telas funcionam igual nos dois modos.
 */
type Servicos = Omit<typeof mockImpl, "restaurarDadosDeExemplo">;

const firebase: Servicos = firebaseImpl;
const mock: Servicos = mockImpl;

/** Marca, neste navegador, que a sessão atual é a da conta de demonstração. */
const CONTA_DEMO_KEY = "neurowork:conta-demo";

export const modoDemonstracao = !isFirebaseConfigured;

function ehEmailDemo(email: string) {
  return email.trim().toLowerCase() === DEMO_LOGIN.email;
}

/** Indica se este navegador está usando a conta de demonstração (sempre verdadeiro sem Firebase). */
export function contaDemoAtiva(): boolean {
  if (!isFirebaseConfigured) return true;
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONTA_DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

function marcarContaDemo(ativa: boolean) {
  if (!isFirebaseConfigured || typeof window === "undefined") return;
  try {
    if (ativa) window.localStorage.setItem(CONTA_DEMO_KEY, "1");
    else window.localStorage.removeItem(CONTA_DEMO_KEY);
  } catch {
    // Sem acesso ao armazenamento do navegador: segue sem a conta de demonstração
  }
}

function servicoAtual(): Servicos {
  return contaDemoAtiva() ? mock : firebase;
}

/** Encaminha a chamada para a implementação da sessão atual (Firebase ou dados de exemplo). */
function daSessao<K extends keyof Servicos>(nome: K): Servicos[K] {
  return ((...args: unknown[]) =>
    (servicoAtual()[nome] as (...parametros: unknown[]) => unknown)(...args)) as Servicos[K];
}

export async function login(email: string, senha: string) {
  if (!isFirebaseConfigured) return mock.login(email, senha);

  if (ehEmailDemo(email)) {
    const sessao = await mock.login(email, senha);
    marcarContaDemo(true);
    return sessao;
  }

  marcarContaDemo(false);
  await mock.logout();
  return firebase.login(email, senha);
}

export async function cadastrarEmpresa(input: CadastroEmpresaInput) {
  if (!isFirebaseConfigured) return mock.cadastrarEmpresa(input);

  if (ehEmailDemo(input.email)) {
    throw new ServiceError("Este e-mail é reservado para a conta de demonstração.");
  }
  marcarContaDemo(false);
  await mock.logout();
  return firebase.cadastrarEmpresa(input);
}

export async function logout() {
  const servico = servicoAtual();
  marcarContaDemo(false);
  return servico.logout();
}

export const recuperarSenha = daSessao("recuperarSenha");
export const observarSessao = daSessao("observarSessao");
export const listarVagas = daSessao("listarVagas");
export const obterVaga = daSessao("obterVaga");
export const obterVagaPublica = daSessao("obterVagaPublica");
export const criarVaga = daSessao("criarVaga");
export const atualizarVaga = daSessao("atualizarVaga");
export const alterarStatusVaga = daSessao("alterarStatusVaga");
export const salvarEtapas = daSessao("salvarEtapas");
export const listarCandidaturas = daSessao("listarCandidaturas");
export const obterCandidatura = daSessao("obterCandidatura");
export const alterarStatusCandidatura = daSessao("alterarStatusCandidatura");
export const enviarCandidatura = daSessao("enviarCandidatura");
export const salvarRespostas = daSessao("salvarRespostas");
export const compartilharAjustes = daSessao("compartilharAjustes");
export const excluirCandidatura = daSessao("excluirCandidatura");
export const excluirMinhaCandidatura = daSessao("excluirMinhaCandidatura");
export const obterArquivo = daSessao("obterArquivo");
export const exportarDados = daSessao("exportarDados");
export const obterEmpresaAtual = daSessao("obterEmpresaAtual");
export const atualizarEmpresa = daSessao("atualizarEmpresa");
export const obterResumoPainel = daSessao("obterResumoPainel");
export const contratarPlanoSimulado = daSessao("contratarPlanoSimulado");
export const gerarRelatorioVaga = daSessao("gerarRelatorioVaga");

/** Só se aplica aos dados de exemplo (modo demonstração ou conta de demonstração). */
export const restaurarDadosDeExemplo = mockImpl.restaurarDadosDeExemplo;

export {
  ServiceError,
  getLinkDaVaga,
  listarPlanos,
  obterPlano,
  type ArquivoConteudo,
  type AtualizarEmpresaInput,
  type BackupEmpresa,
  type CadastroEmpresaInput,
  type CandidaturaComVaga,
  type CandidaturaDetalhe,
  type RelatorioVaga,
  type ResumoPainel,
  type VagaComResumo,
} from "./shared";
