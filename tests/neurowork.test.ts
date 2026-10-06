/**
 * Testes automatizados da camada de serviços, no modo demonstração.
 *
 * As telas usam somente estas funções; por isso, testá-las confere as regras do
 * sistema sem abrir o navegador. Cada grupo corresponde a uma linha da Tabela 1
 * da monografia (Resultados da validação das funcionalidades).
 *
 * Rodar: npm test
 */
import "./ambiente-navegador";

import assert from "node:assert/strict";
import { before, beforeEach, describe, test } from "node:test";

import { BANCO_PERGUNTAS, CATEGORIAS_BANCO } from "@/data/banco-perguntas";
import { DEMO_LOGIN } from "@/data/seed";
import { AJUSTES, ATALHOS, isAjusteId } from "@/lib/ajustes";
import { MAX_CERTIFICADOS, MAX_FILE_SIZE } from "@/lib/constants";
import {
  alterarStatusCandidatura,
  alterarStatusVaga,
  atualizarVaga,
  cadastrarEmpresa,
  compartilharAjustes,
  criarVaga,
  enviarCandidatura,
  excluirCandidatura,
  excluirMinhaCandidatura,
  exportarDados,
  gerarRelatorioVaga,
  getLinkDaVaga,
  listarCandidaturas,
  listarVagas,
  login,
  logout,
  modoDemonstracao,
  obterCandidatura,
  obterEmpresaAtual,
  obterResumoPainel,
  obterVaga,
  obterVagaPublica,
  salvarEtapas,
  salvarRespostas,
  ServiceError,
} from "@/lib/services";
import { candidaturaSchema } from "@/lib/validations/candidatura";
import type { Etapa, NovaCandidatura, VagaInput } from "@/types";

/* ---------- Dados usados nos testes ---------- */

const VAGA: VagaInput = {
  titulo: "Desenvolvedor(a) Júnior",
  descricao: "Construir telas web com React.",
  requisitos: "HTML, CSS e JavaScript.",
  modalidade: "remoto",
  local: "Remoto (Brasil)",
  faixaSalarial: "R$ 3.000,00",
  adaptacoes: ["Avaliação sem limite de tempo"],
};

const ETAPAS: Etapa[] = [
  {
    id: "etp_teste",
    titulo: "Sobre você",
    instrucoes: "Não existe resposta errada.",
    perguntas: [
      {
        id: "prg_projeto",
        enunciado: "Conte sobre um projeto de que você se orgulha.",
        tipo: "dissertativa",
        opcoes: [],
        orientacao: "Diga o que você fez e por que gostou.",
        exemplo: "",
      },
      {
        id: "prg_instrucoes",
        enunciado: "Como você prefere receber instruções?",
        tipo: "multipla_escolha",
        opcoes: ["Por escrito", "Em conversa"],
        orientacao: "",
        exemplo: "",
      },
    ],
  },
];

const RESPOSTAS = { prg_projeto: "Fiz o site da feira de ciências.", prg_instrucoes: "Por escrito" };

/** Mesma lista fechada de campos da regra de criação de candidaturas (firestore.rules), mais o id. */
const CAMPOS_DA_CANDIDATURA = [
  "id",
  "vagaId",
  "empresaId",
  "nome",
  "email",
  "telefone",
  "cidade",
  "curriculo",
  "portfolio",
  "certificados",
  "portfolioLink",
  "adaptacoes",
  "consentimentoLgpd",
  "status",
  "respostas",
  "avaliacaoConcluida",
  "ajustesCompartilhados",
  "enviadaEm",
];

/** Termos de saúde que não podem aparecer no banco de perguntas nem nos dados guardados. */
const TERMOS_DE_SAUDE =
  /autis|tdah|tea\b|dislex|diagn[oó]s|transtorno|defici[eê]n|laudo|doen[cç]a|s[ií]ndrome|condi[cç][aã]o|sa[uú]de|m[eé]dic|neurodiver/i;

function cadastrar(nome: string, email: string, cnpj: string) {
  return cadastrarEmpresa({
    nome,
    cnpj,
    email,
    responsavel: "Pessoa Responsável",
    telefone: "(47) 99999-0000",
    senha: "senha1234",
  });
}

function dadosDoCandidato(extra: Partial<NovaCandidatura> = {}): NovaCandidatura {
  return {
    nome: "Lucas Almeida",
    email: "lucas@email.com",
    telefone: "(47) 98888-7777",
    cidade: "Blumenau – SC",
    curriculo: { nome: "curriculo.pdf", tamanho: 120_000 },
    portfolio: null,
    certificados: [],
    portfolioLink: "",
    adaptacoes: "",
    consentimentoLgpd: true,
    ...extra,
  };
}

function pdf(nome: string, tamanho = 1000, tipo = "application/pdf") {
  return new File([new Uint8Array(tamanho)], nome, { type: tipo });
}

/** Campos do formulário de candidatura preenchidos corretamente (validação Yup). */
function formularioValido() {
  return {
    nome: "Lucas Almeida",
    email: "lucas@email.com",
    telefone: "(47) 98888-7777",
    cidade: "Blumenau – SC",
    curriculo: pdf("curriculo.pdf"),
    certificados: [] as File[],
    consentimentoLgpd: true,
  };
}

/** Empresa cria uma vaga com processo seletivo e sai; devolve a vaga. */
async function empresaComVaga(nome = "Empresa A", email = "rh@empresa-a.com", cnpj = "11.444.777/0001-61") {
  await cadastrar(nome, email, cnpj);
  const vaga = await criarVaga(VAGA);
  await salvarEtapas(vaga.id, ETAPAS);
  await logout();
  return { ...vaga, etapas: ETAPAS };
}

before(() => {
  assert.equal(modoDemonstracao, true, "os testes usam o modo demonstração, sem chaves do Firebase");
});

beforeEach(async () => {
  window.localStorage.clear();
  await logout();
});

/* ---------- Tabela 1: Cadastro e login da empresa ---------- */

describe("Cadastro e login da empresa", () => {
  test("empresa cadastrada consegue entrar e ver os próprios dados", async () => {
    const cadastro = await cadastrar("Empresa A", "rh@empresa-a.com", "11.444.777/0001-61");
    await logout();
    await assert.rejects(obterEmpresaAtual(), ServiceError, "sem login não há acesso");

    const sessao = await login("RH@empresa-a.com", "senha1234");
    assert.equal(sessao.empresaId, cadastro.empresaId);

    const empresa = await obterEmpresaAtual();
    assert.equal(empresa.nome, "Empresa A");
    assert.equal(empresa.cnpj, "11.444.777/0001-61");
    assert.equal(empresa.plano, null, "a conta nasce sem plano");
    assert.equal("senha" in empresa, false, "a senha não é guardada junto com a empresa");
  });

  test("recusa e-mail sem conta, senha errada e cadastro repetido", async () => {
    await assert.rejects(login("ninguem@empresa.com", "senha1234"), ServiceError);
    await assert.rejects(login(DEMO_LOGIN.email, "senha-errada"), ServiceError);
    await login(DEMO_LOGIN.email, DEMO_LOGIN.senha);
    await logout();

    await cadastrar("Empresa A", "rh@empresa-a.com", "11.444.777/0001-61");
    await logout();
    await assert.rejects(cadastrar("Outra", "rh@empresa-a.com", "45.723.174/0001-10"), /e-mail/);
    await assert.rejects(cadastrar("Outra", "rh@outra.com", "11.444.777/0001-61"), /CNPJ/);
  });
});

/* ---------- Tabela 1: Isolamento entre empresas ---------- */

describe("Isolamento entre empresas", () => {
  test("uma empresa não vê as vagas nem as candidaturas de outra", async () => {
    const vagaA = await empresaComVaga();
    await enviarCandidatura(vagaA.id, dadosDoCandidato());

    await cadastrar("Empresa B", "rh@empresa-b.com", "45.723.174/0001-10");
    assert.deepEqual(await listarVagas(), []);
    assert.deepEqual(await listarCandidaturas(), []);
    assert.equal((await obterResumoPainel()).totalCandidaturas, 0);

    const backup = await exportarDados();
    assert.equal(backup.vagas.length, 0);
    assert.equal(backup.candidaturas.length, 0);
  });

  test("uma empresa não abre, altera nem exclui dados de outra", async () => {
    const vagaA = await empresaComVaga();
    const candidatura = await enviarCandidatura(vagaA.id, dadosDoCandidato());

    await cadastrar("Empresa B", "rh@empresa-b.com", "45.723.174/0001-10");
    await assert.rejects(obterVaga(vagaA.id), ServiceError);
    await assert.rejects(atualizarVaga(vagaA.id, { ...VAGA, titulo: "Alterada" }), ServiceError);
    await assert.rejects(alterarStatusVaga(vagaA.id, "encerrada"), ServiceError);
    await assert.rejects(salvarEtapas(vagaA.id, []), ServiceError);
    await assert.rejects(gerarRelatorioVaga(vagaA.id), ServiceError);
    await assert.rejects(obterCandidatura(candidatura.id), ServiceError);
    await assert.rejects(alterarStatusCandidatura(candidatura.id, "reprovado"), ServiceError);
    await assert.rejects(excluirCandidatura(candidatura.id), ServiceError);

    // Os dados da Empresa A continuam iguais
    await logout();
    await login("rh@empresa-a.com", "senha1234");
    const vaga = await obterVaga(vagaA.id);
    assert.equal(vaga.titulo, VAGA.titulo);
    assert.equal(vaga.status, "aberta");
    assert.equal(vaga.etapas.length, 1);
    assert.equal((await obterCandidatura(candidatura.id)).status, "nova");
  });
});

/* ---------- Tabela 1: Criação de vaga e link ---------- */

describe("Criação de vaga e link", () => {
  test("a vaga criada aparece pelo link público, sem login", async () => {
    await cadastrar("Empresa A", "rh@empresa-a.com", "11.444.777/0001-61");
    const vaga = await criarVaga(VAGA);
    const outra = await criarVaga(VAGA);

    assert.equal(vaga.status, "aberta");
    assert.match(vaga.slug, /^desenvolvedor-a-junior-[a-z0-9]+$/);
    assert.notEqual(vaga.slug, outra.slug, "cada vaga tem o próprio link");
    assert.equal(getLinkDaVaga(vaga.slug), `http://localhost:3000/vaga/${vaga.slug}`);

    await logout();
    const publica = await obterVagaPublica(vaga.slug);
    assert.equal(publica.id, vaga.id);
    assert.equal(publica.empresaNome, "Empresa A");
    assert.deepEqual(publica.adaptacoes, VAGA.adaptacoes);
    await assert.rejects(obterVagaPublica("link-que-nao-existe"), ServiceError);
  });

  test("vaga encerrada deixa de receber candidaturas e volta ao ser reaberta", async () => {
    await cadastrar("Empresa A", "rh@empresa-a.com", "11.444.777/0001-61");
    const vaga = await criarVaga(VAGA);

    await alterarStatusVaga(vaga.id, "encerrada");
    await assert.rejects(obterVagaPublica(vaga.slug), /encerrada/);
    await assert.rejects(enviarCandidatura(vaga.id, dadosDoCandidato()), ServiceError);

    await alterarStatusVaga(vaga.id, "aberta");
    assert.equal((await obterVagaPublica(vaga.slug)).id, vaga.id);
  });
});

/* ---------- Tabela 1: Candidatura e avaliação adaptada ---------- */

describe("Candidatura e avaliação adaptada", () => {
  test("a candidatura chega à empresa com as respostas e os ajustes compartilhados", async () => {
    const vaga = await empresaComVaga();

    // Candidato, sem conta
    const enviada = await enviarCandidatura(vaga.id, dadosDoCandidato());
    assert.equal(enviada.status, "nova");
    assert.equal(enviada.avaliacaoConcluida, false);
    await compartilharAjustes(enviada.id, ["uma_por_tela", "pausa"]);
    await salvarRespostas(enviada.id, { prg_projeto: "Rascunho" }, false);
    await salvarRespostas(enviada.id, RESPOSTAS, true);
    await assert.rejects(salvarRespostas(enviada.id, {}, true), /já foi enviada/);

    // Empresa
    await login("rh@empresa-a.com", "senha1234");
    const lista = await listarCandidaturas({ vagaId: vaga.id });
    assert.equal(lista.length, 1);
    assert.equal(lista[0].vagaTitulo, VAGA.titulo);

    const detalhe = await obterCandidatura(enviada.id);
    assert.deepEqual(detalhe.respostas, RESPOSTAS);
    assert.deepEqual(detalhe.ajustesCompartilhados, ["uma_por_tela", "pausa"]);
    assert.equal(detalhe.avaliacaoConcluida, true);
    assert.equal(detalhe.vaga.etapas[0].perguntas.length, 2);

    await alterarStatusCandidatura(enviada.id, "aprovado");
    const relatorio = await gerarRelatorioVaga(vaga.id);
    assert.equal(relatorio.totalCandidatos, 1);
    assert.equal(relatorio.porStatus.find((s) => s.status === "aprovado")?.quantidade, 1);
  });

  test("exige o aceite da LGPD e não guarda condição nem diagnóstico", async () => {
    const vaga = await empresaComVaga();

    await assert.rejects(enviarCandidatura(vaga.id, dadosDoCandidato({ consentimentoLgpd: false })), /aceitar/);
    assert.equal(await candidaturaSchema.isValid({ ...formularioValido(), consentimentoLgpd: false }), false);

    const enviada = await enviarCandidatura(vaga.id, dadosDoCandidato());
    await compartilharAjustes(enviada.id, ["texto_maior"]);
    await salvarRespostas(enviada.id, RESPOSTAS, true);

    await login("rh@empresa-a.com", "senha1234");
    const { vaga: _vaga, ...guardada } = await obterCandidatura(enviada.id);
    for (const campo of Object.keys(guardada)) {
      assert.ok(CAMPOS_DA_CANDIDATURA.includes(campo), `campo fora da lista fechada: ${campo}`);
    }
    assert.doesNotMatch(Object.keys(guardada).join(" "), TERMOS_DE_SAUDE);
    assert.ok(guardada.ajustesCompartilhados.every(isAjusteId), "só nomes de ajustes, nunca a condição");
  });
});

/* ---------- Tabela 1: Certificados, exclusão e backup ---------- */

describe("Certificados, exclusão e backup", () => {
  test("aceita até 5 certificados em PDF de até 5 MB e guarda nome e tamanho", async () => {
    const cinco = Array.from({ length: MAX_CERTIFICADOS }, (_, i) => pdf(`certificado-${i + 1}.pdf`, 2000));
    assert.equal(await candidaturaSchema.isValid({ ...formularioValido(), certificados: cinco }), true);
    assert.equal(
      await candidaturaSchema.isValid({ ...formularioValido(), certificados: [...cinco, pdf("sexto.pdf")] }),
      false,
      "mais de 5 certificados"
    );
    assert.equal(
      await candidaturaSchema.isValid({ ...formularioValido(), certificados: [pdf("foto.png", 1000, "image/png")] }),
      false,
      "certificado que não é PDF"
    );
    assert.equal(
      await candidaturaSchema.isValid({ ...formularioValido(), curriculo: pdf("grande.pdf", MAX_FILE_SIZE + 1) }),
      false,
      "currículo acima de 5 MB"
    );

    const vaga = await empresaComVaga();
    const certificados = cinco.map((f) => ({ nome: f.name, tamanho: f.size }));
    const enviada = await enviarCandidatura(vaga.id, dadosDoCandidato({ certificados }));

    await login("rh@empresa-a.com", "senha1234");
    const detalhe = await obterCandidatura(enviada.id);
    assert.deepEqual(detalhe.certificados, certificados);
    assert.deepEqual(detalhe.curriculo, { nome: "curriculo.pdf", tamanho: 120_000 });
  });

  test("a candidatura excluída some do painel e o backup traz só os dados da empresa", async () => {
    const vaga = await empresaComVaga();
    const primeira = await enviarCandidatura(vaga.id, dadosDoCandidato({ nome: "Primeira Pessoa" }));
    const segunda = await enviarCandidatura(vaga.id, dadosDoCandidato({ nome: "Segunda Pessoa" }));
    const terceira = await enviarCandidatura(vaga.id, dadosDoCandidato({ nome: "Terceira Pessoa" }));

    // O próprio candidato exclui a candidatura, na tela de conclusão
    await excluirMinhaCandidatura(primeira.id);

    // A empresa exclui a pedido do candidato
    await login("rh@empresa-a.com", "senha1234");
    await excluirCandidatura(segunda.id);

    const restantes = await listarCandidaturas();
    assert.deepEqual(
      restantes.map((c) => c.id),
      [terceira.id]
    );

    const backup = await exportarDados();
    assert.ok(!Number.isNaN(Date.parse(backup.geradoEm)));
    assert.equal(backup.empresa.email, "rh@empresa-a.com");
    assert.deepEqual(
      backup.vagas.map((v) => v.id),
      [vaga.id]
    );
    assert.deepEqual(
      backup.candidaturas.map((c) => c.id),
      [terceira.id]
    );
    assert.doesNotMatch(JSON.stringify(backup), /senha/i, "o backup não tem senha");
    assert.doesNotMatch(JSON.stringify(backup), /Aurora Tecnologia/, "o backup não tem dados de outra empresa");
  });
});

/* ---------- Tabela 1: Banco de perguntas e atalhos ---------- */

describe("Banco de perguntas e atalhos", () => {
  test("o banco tem 16 perguntas em 7 categorias, sem termos de saúde", () => {
    assert.equal(BANCO_PERGUNTAS.length, 16);
    assert.equal(CATEGORIAS_BANCO.length, 7);
    assert.deepEqual(new Set(BANCO_PERGUNTAS.map((p) => p.categoria)), new Set(CATEGORIAS_BANCO));
    assert.equal(new Set(BANCO_PERGUNTAS.map((p) => p.codigo)).size, 16, "códigos sem repetição");

    for (const pergunta of BANCO_PERGUNTAS) {
      assert.ok(pergunta.enunciado.trim(), `${pergunta.codigo}: enunciado vazio`);
      assert.ok(pergunta.orientacao.trim(), `${pergunta.codigo}: falta "o que a empresa quer saber"`);
      if (pergunta.tipo === "multipla_escolha") assert.ok(pergunta.opcoes.length >= 2);
      const texto = [pergunta.enunciado, pergunta.orientacao, pergunta.exemplo, ...pergunta.opcoes].join(" ");
      assert.doesNotMatch(texto, TERMOS_DE_SAUDE, `${pergunta.codigo}: termo de saúde`);
    }
  });

  test("os atalhos só sugerem ajustes que existem", () => {
    assert.equal(AJUSTES.length, 6);
    assert.equal(new Set(AJUSTES.map((a) => a.id)).size, 6);
    assert.deepEqual(
      ATALHOS.map((a) => a.id),
      ["tea", "tdah", "dislexia", "manual"]
    );

    for (const atalho of ATALHOS) {
      assert.ok(atalho.sugestao.every(isAjusteId), `${atalho.id}: ajuste inexistente`);
      assert.equal(new Set(atalho.sugestao).size, atalho.sugestao.length, `${atalho.id}: ajuste repetido`);
    }
    assert.deepEqual(ATALHOS.find((a) => a.id === "manual")?.sugestao, [], "escolher sozinho não marca nada");
  });
});
