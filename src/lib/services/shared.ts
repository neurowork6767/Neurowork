import { PLANOS } from "@/data/planos";
import { CANDIDATURA_STATUS_LABEL, MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "@/lib/constants";
import type {
  ArquivoEnviado,
  ArquivoInfo,
  Candidatura,
  CandidaturaStatus,
  Empresa,
  NovaCandidatura,
  Plano,
  TipoArquivo,
  Vaga,
} from "@/types";

/**
 * Tipos e funções usados pelas duas implementações da camada de serviços
 * (dados de exemplo e Firebase), para que as telas recebam sempre o mesmo formato.
 */

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export type CadastroEmpresaInput = {
  nome: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  senha: string;
};

export type AtualizarEmpresaInput = Pick<Empresa, "nome" | "responsavel" | "telefone">;

export type VagaComResumo = Vaga & { totalCandidaturas: number };

export type CandidaturaComVaga = Candidatura & { vagaTitulo: string };

export type CandidaturaDetalhe = Candidatura & { vaga: Vaga };

/** PDF guardado à parte da candidatura (no Firestore, na subcoleção "arquivos"). */
export type ArquivoGuardado = { id: string; nome: string; tamanho: number; tipo: TipoArquivo; conteudo: string };

/** O que a empresa recebe ao abrir um arquivo: o nome e o PDF em base64. */
export type ArquivoConteudo = { nome: string; conteudo: string };

/**
 * Separa o conteúdo dos PDFs, que é guardado à parte, dos dados da candidatura,
 * que ficam só com o nome, o tamanho e o id de cada arquivo.
 */
export function prepararArquivos(dados: NovaCandidatura, novoId: () => string) {
  const guardados: ArquivoGuardado[] = [];

  function registrar(arquivo: ArquivoEnviado, tipo: TipoArquivo): ArquivoInfo {
    if (!arquivo.conteudo) return { nome: arquivo.nome, tamanho: arquivo.tamanho };
    // Em base64, cada 4 caracteres representam 3 bytes do arquivo
    if (arquivo.tamanho > MAX_FILE_SIZE || (arquivo.conteudo.length * 3) / 4 > MAX_FILE_SIZE + 3) {
      throw new ServiceError(`O arquivo "${arquivo.nome}" passa de ${MAX_FILE_SIZE_LABEL}.`);
    }
    const id = novoId();
    guardados.push({ id, nome: arquivo.nome, tamanho: arquivo.tamanho, tipo, conteudo: arquivo.conteudo });
    return { nome: arquivo.nome, tamanho: arquivo.tamanho, id };
  }

  return {
    curriculo: registrar(dados.curriculo, "curriculo"),
    portfolio: dados.portfolio ? registrar(dados.portfolio, "portfolio") : null,
    certificados: dados.certificados.map((certificado) => registrar(certificado, "certificado")),
    guardados,
  };
}

/** Ids dos PDFs guardados de uma candidatura (usados para apagar tudo junto). */
export function idsDosArquivos(candidatura: Pick<Candidatura, "curriculo" | "portfolio" | "certificados">): string[] {
  const arquivos = [candidatura.curriculo, candidatura.portfolio, ...candidatura.certificados];
  return arquivos.flatMap((arquivo) => (arquivo?.id ? [arquivo.id] : []));
}

export type ResumoPainel = {
  vagasAbertas: number;
  totalVagas: number;
  totalCandidaturas: number;
  candidaturasNovas: number;
  taxaConclusao: number;
};

/** Cópia de segurança dos dados de uma empresa (RNF-08), baixada em JSON. */
export type BackupEmpresa = {
  geradoEm: string;
  empresa: Empresa;
  vagas: Vaga[];
  candidaturas: Candidatura[];
};

export type RelatorioVaga = {
  vagaId: string;
  vagaTitulo: string;
  totalCandidatos: number;
  porStatus: { status: CandidaturaStatus; label: string; quantidade: number }[];
  avaliacoesConcluidas: number;
  taxaConclusao: number;
};

export function getLinkDaVaga(slug: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/vaga/${slug}`;
}

export function obterPlano(id: string): Plano | undefined {
  return PLANOS.find((p) => p.id === id);
}

export async function listarPlanos(): Promise<Plano[]> {
  return PLANOS;
}

export function calcularResumo(vagas: Vaga[], candidaturas: Candidatura[]): ResumoPainel {
  const concluidas = candidaturas.filter((c) => c.avaliacaoConcluida).length;
  return {
    vagasAbertas: vagas.filter((v) => v.status === "aberta").length,
    totalVagas: vagas.length,
    totalCandidaturas: candidaturas.length,
    candidaturasNovas: candidaturas.filter((c) => c.status === "nova").length,
    taxaConclusao: candidaturas.length ? Math.round((concluidas / candidaturas.length) * 100) : 0,
  };
}

export function montarRelatorio(vaga: Vaga, candidaturas: Candidatura[]): RelatorioVaga {
  const concluidas = candidaturas.filter((c) => c.avaliacaoConcluida).length;
  const statuses = Object.keys(CANDIDATURA_STATUS_LABEL) as CandidaturaStatus[];
  return {
    vagaId: vaga.id,
    vagaTitulo: vaga.titulo,
    totalCandidatos: candidaturas.length,
    porStatus: statuses.map((status) => ({
      status,
      label: CANDIDATURA_STATUS_LABEL[status],
      quantidade: candidaturas.filter((c) => c.status === status).length,
    })),
    avaliacoesConcluidas: concluidas,
    taxaConclusao: candidaturas.length ? Math.round((concluidas / candidaturas.length) * 100) : 0,
  };
}

export function comResumo(vagas: Vaga[], candidaturas: Candidatura[]): VagaComResumo[] {
  return [...vagas]
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
    .map((vaga) => ({ ...vaga, totalCandidaturas: candidaturas.filter((c) => c.vagaId === vaga.id).length }));
}

export function comTituloDaVaga(candidaturas: Candidatura[], vagas: Vaga[]): CandidaturaComVaga[] {
  return [...candidaturas]
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))
    .map((c) => ({ ...c, vagaTitulo: vagas.find((v) => v.id === c.vagaId)?.titulo ?? "" }));
}
