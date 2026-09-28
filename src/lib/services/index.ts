import { isFirebaseConfigured } from "@/lib/firebase";
import * as firebaseImpl from "./firebase";
import * as mockImpl from "./mock";

/**
 * Camada de serviços (RNF-09): as telas importam dados apenas daqui.
 *
 * - Com as chaves do Firebase no .env.local → usa Firebase Authentication e Firestore.
 * - Sem as chaves → modo demonstração, com dados de exemplo salvos no navegador.
 *
 * O tipo abaixo obriga as duas implementações a terem exatamente as mesmas funções,
 * então as telas funcionam igual nos dois modos.
 */
type Servicos = Omit<typeof mockImpl, "restaurarDadosDeExemplo">;

const servicos: Servicos = isFirebaseConfigured ? firebaseImpl : mockImpl;

export const modoDemonstracao = !isFirebaseConfigured;

export const {
  login,
  cadastrarEmpresa,
  recuperarSenha,
  logout,
  observarSessao,
  listarVagas,
  obterVaga,
  obterVagaPublica,
  criarVaga,
  atualizarVaga,
  alterarStatusVaga,
  salvarEtapas,
  listarCandidaturas,
  obterCandidatura,
  alterarStatusCandidatura,
  enviarCandidatura,
  salvarRespostas,
  compartilharAjustes,
  obterEmpresaAtual,
  atualizarEmpresa,
  obterResumoPainel,
  contratarPlanoSimulado,
  gerarRelatorioVaga,
} = servicos;

/** Só existe no modo demonstração. */
export const restaurarDadosDeExemplo = mockImpl.restaurarDadosDeExemplo;

export {
  ServiceError,
  getLinkDaVaga,
  listarPlanos,
  obterPlano,
  type AtualizarEmpresaInput,
  type CadastroEmpresaInput,
  type CandidaturaComVaga,
  type CandidaturaDetalhe,
  type RelatorioVaga,
  type ResumoPainel,
  type VagaComResumo,
} from "./shared";
