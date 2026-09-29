import type { Pergunta } from "@/types";

/**
 * Banco de perguntas NeuroWork (RF-17).
 *
 * Modelos escritos pela equipe em linguagem clara e literal, sem duplo sentido,
 * cada um com a explicação "o que a empresa quer saber" e, quando ajuda, um exemplo.
 * A empresa escolhe, edita ou cria as próprias perguntas (RF-04, RF-07).
 * Nenhuma pergunta trata de saúde, diagnóstico ou comportamento social avaliado por aparência.
 */

export type BancoPergunta = Omit<Pergunta, "id"> & {
  codigo: string;
  categoria: CategoriaBanco;
};

export const CATEGORIAS_BANCO = [
  "Sobre você",
  "Comunicação",
  "Organização",
  "Resolução de problemas",
  "Trabalho em equipe",
  "Tecnologia",
  "Atendimento",
] as const;

export type CategoriaBanco = (typeof CATEGORIAS_BANCO)[number];

export const BANCO_PERGUNTAS: BancoPergunta[] = [
  // ---------- Sobre você ----------
  {
    codigo: "sobre-projeto",
    categoria: "Sobre você",
    tipo: "dissertativa",
    enunciado: "Conte sobre um projeto (da escola, pessoal ou de trabalho) de que você se orgulha.",
    opcoes: [],
    orientacao:
      "Escreva sobre algo que você fez. Responda nesta ordem:\n1. O nome ou o assunto do projeto.\n2. O que você fez nele.\n3. Por que você gostou do resultado.\nTamanho: de 3 a 6 frases.",
    exemplo:
      "Fiz um site para a feira de ciências. Eu criei as páginas com HTML e CSS. Gostei porque os colegas conseguiram usar sem ajuda.",
  },
  {
    codigo: "sobre-interesse",
    categoria: "Sobre você",
    tipo: "dissertativa",
    enunciado: "Por que você quer trabalhar nesta vaga?",
    opcoes: [],
    orientacao:
      "Responda em 2 a 4 frases:\n1. O que chamou sua atenção na vaga.\n2. O que você gostaria de aprender ou fazer nela.",
    exemplo:
      "Gostei porque a vaga é de programação, que é o que estudo. Quero aprender a trabalhar em equipe em projetos reais.",
  },
  {
    codigo: "sobre-rotina",
    categoria: "Sobre você",
    tipo: "multipla_escolha",
    enunciado: "Qual destas formas de trabalho combina mais com você?",
    opcoes: [
      "Tarefas parecidas todos os dias",
      "Tarefas diferentes a cada dia",
      "Uma mistura das duas",
      "Não tenho preferência",
    ],
    orientacao:
      "Escolha uma opção. Não existe resposta melhor ou pior: a empresa quer entender como organizar suas tarefas.",
    exemplo: "",
  },

  // ---------- Comunicação ----------
  {
    codigo: "com-instrucoes",
    categoria: "Comunicação",
    tipo: "multipla_escolha",
    enunciado: "Como você prefere receber instruções de trabalho?",
    opcoes: ["Por escrito", "Em conversa", "Por vídeo ou áudio", "Tanto faz"],
    orientacao:
      "Escolha a forma que mais ajuda você a entender uma tarefa. A empresa usa isso para se comunicar melhor.",
    exemplo: "",
  },
  {
    codigo: "com-duvidas",
    categoria: "Comunicação",
    tipo: "multipla_escolha",
    enunciado: "Como você prefere tirar dúvidas no trabalho?",
    opcoes: ["Mensagem escrita", "Conversa por vídeo", "Conversa pessoalmente", "Tanto faz"],
    orientacao: "Escolha uma opção. Não existe resposta errada.",
    exemplo: "",
  },
  {
    codigo: "com-explicar",
    categoria: "Comunicação",
    tipo: "dissertativa",
    enunciado: "Descreva uma vez em que você explicou algo para outra pessoa.",
    opcoes: [],
    orientacao:
      "Responda nesta ordem:\n1. O que você explicou.\n2. Para quem.\n3. O que você fez para a pessoa entender.",
    exemplo:
      "Expliquei para minha avó como fazer chamada de vídeo. Escrevi os passos num papel e fizemos juntas duas vezes.",
  },

  // ---------- Organização ----------
  {
    codigo: "org-prioridade",
    categoria: "Organização",
    tipo: "dissertativa",
    enunciado: "Você recebeu três tarefas com o mesmo prazo. Como você decide qual fazer primeiro?",
    opcoes: [],
    orientacao: "Explique os passos que você seguiria, em ordem. Pode responder em forma de lista.",
    exemplo:
      "1. Vejo qual tarefa é mais urgente para o cliente. 2. Começo pela mais rápida. 3. Aviso o responsável se não der tempo.",
  },
  {
    codigo: "org-prazos",
    categoria: "Organização",
    tipo: "multipla_escolha",
    enunciado: "O que mais ajuda você a cumprir prazos?",
    opcoes: [
      "Uma lista de tarefas escrita",
      "Lembretes no celular",
      "Dividir a tarefa em partes menores",
      "Outra forma",
    ],
    orientacao: "Escolha a opção que você mais usa. A empresa quer saber como apoiar sua organização.",
    exemplo: "",
  },

  // ---------- Resolução de problemas ----------
  {
    codigo: "prob-resolvido",
    categoria: "Resolução de problemas",
    tipo: "dissertativa",
    enunciado: "Conte sobre um problema que você resolveu. Pode ser da escola, de casa ou de trabalho.",
    opcoes: [],
    orientacao: "Responda nesta ordem:\n1. Qual era o problema.\n2. O que você fez.\n3. Qual foi o resultado.",
    exemplo:
      "O computador da escola não ligava. Verifiquei os cabos e achei um solto. Depois de encaixar, ele funcionou.",
  },
  {
    codigo: "prob-sistema",
    categoria: "Resolução de problemas",
    tipo: "dissertativa",
    enunciado: "Um sistema que você usa no trabalho parou de funcionar. O que você faz?",
    opcoes: [],
    orientacao: "Descreva os passos que você seguiria, em ordem. Não precisa saber a solução técnica.",
    exemplo: "1. Tento abrir de novo. 2. Anoto a mensagem de erro. 3. Aviso o suporte com a mensagem e o horário.",
  },

  // ---------- Trabalho em equipe ----------
  {
    codigo: "equipe-parte",
    categoria: "Trabalho em equipe",
    tipo: "dissertativa",
    enunciado: "Conte sobre uma vez em que você trabalhou em grupo. Qual foi a sua parte no trabalho?",
    opcoes: [],
    orientacao: "Responda nesta ordem:\n1. O que o grupo fez.\n2. O que você fez.\nTamanho: de 2 a 5 frases.",
    exemplo: "Fizemos uma apresentação sobre energia solar. Eu pesquisei os dados e montei os gráficos.",
  },
  {
    codigo: "equipe-papel",
    categoria: "Trabalho em equipe",
    tipo: "multipla_escolha",
    enunciado: "Em um trabalho em grupo, qual parte você prefere fazer?",
    opcoes: ["Organizar as tarefas", "Fazer a parte prática", "Pesquisar informações", "Revisar o resultado final"],
    orientacao: "Escolha a parte em que você se sente melhor. Todas são importantes.",
    exemplo: "",
  },

  // ---------- Tecnologia ----------
  {
    codigo: "tec-html-link",
    categoria: "Tecnologia",
    tipo: "multipla_escolha",
    enunciado: "Qual tag HTML é usada para criar um link?",
    opcoes: ["<a>", "<link>", "<href>", "<url>"],
    orientacao: "Escolha uma opção. Se não souber, pode escolher a que achar mais provável.",
    exemplo: "",
  },
  {
    codigo: "tec-banco-dados",
    categoria: "Tecnologia",
    tipo: "dissertativa",
    enunciado: "Explique, com suas palavras, o que é um banco de dados.",
    opcoes: [],
    orientacao: "Uma explicação simples basta, de 2 a 4 frases. Pode usar um exemplo do dia a dia.",
    exemplo: "É um lugar onde um sistema guarda informações organizadas, como a lista de clientes de uma loja.",
  },
  {
    codigo: "tec-erro",
    categoria: "Tecnologia",
    tipo: "dissertativa",
    enunciado: "Um programa que você escreveu não funciona. Quais passos você segue para encontrar o erro?",
    opcoes: [],
    orientacao: "Descreva os passos em ordem. Pode responder em forma de lista.",
    exemplo: "1. Leio a mensagem de erro. 2. Vejo a linha indicada. 3. Testo partes do código separadamente.",
  },

  // ---------- Atendimento ----------
  {
    codigo: "atend-reclamacao",
    categoria: "Atendimento",
    tipo: "dissertativa",
    enunciado: "Um cliente escreveu reclamando que o pedido atrasou. Escreva a resposta que você enviaria a ele.",
    opcoes: [],
    orientacao: "Escreva como se fosse a mensagem de verdade para o cliente. Tamanho: de 3 a 6 frases.",
    exemplo:
      "Olá, Ana. Sinto muito pelo atraso. Verifiquei e seu pedido chega amanhã. Se precisar de algo, estou à disposição.",
  },
];
