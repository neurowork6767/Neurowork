import type { Pergunta } from "@/types";

/**
 * Banco de perguntas NeuroWork (RF-17).
 *
 * Modelos escritos pela equipe em linguagem clara e literal, sem duplo sentido,
 * cada um com a explicação "o que a empresa quer saber" e, quando ajuda, um exemplo.
 * Há perguntas para qualquer vaga (comportamento e preferências de trabalho) e perguntas
 * por área de trabalho, para vagas de escritório, comércio, estoque, indústria, cozinha,
 * limpeza, tecnologia, finanças e marketing.
 * A empresa escolhe, edita ou cria as próprias perguntas (RF-04, RF-07).
 * Nenhuma pergunta trata de saúde, diagnóstico ou comportamento social avaliado por aparência.
 * Nos exemplos de perguntas de conhecimento, o exemplo não entrega a resposta.
 */

export type BancoPergunta = Omit<Pergunta, "id"> & {
  codigo: string;
  categoria: CategoriaBanco;
};

/** Perguntas que servem para qualquer vaga */
export const CATEGORIAS_GERAIS = [
  "Sobre você",
  "Comunicação",
  "Organização",
  "Resolução de problemas",
  "Trabalho em equipe",
] as const;

/** Perguntas específicas de cada área de trabalho */
export const CATEGORIAS_AREAS = [
  "Administrativo",
  "Atendimento",
  "Vendas e comércio",
  "Logística e estoque",
  "Produção e indústria",
  "Alimentação",
  "Limpeza e conservação",
  "Tecnologia",
  "Finanças",
  "Marketing e design",
] as const;

export const CATEGORIAS_BANCO = [...CATEGORIAS_GERAIS, ...CATEGORIAS_AREAS] as const;

export type CategoriaBanco = (typeof CATEGORIAS_BANCO)[number];

export const BANCO_PERGUNTAS: BancoPergunta[] = [
  // ==================== Para qualquer vaga ====================

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
  {
    codigo: "sobre-aprender",
    categoria: "Sobre você",
    tipo: "dissertativa",
    enunciado: "Conte sobre algo novo que você aprendeu nos últimos meses.",
    opcoes: [],
    orientacao:
      "Responda nesta ordem:\n1. O que você aprendeu.\n2. Como aprendeu: curso, vídeo, com alguém ou sozinho.\nTamanho: de 2 a 4 frases.",
    exemplo: "Aprendi a fazer planilhas no Excel. Assisti a vídeos e pratiquei com as contas da minha casa.",
  },
  {
    codigo: "sobre-ambiente",
    categoria: "Sobre você",
    tipo: "multipla_escolha",
    enunciado: "Em qual ambiente você trabalha melhor?",
    opcoes: ["Silencioso", "Com um pouco de barulho", "Movimentado", "Não tenho preferência"],
    orientacao:
      "Escolha uma opção. Não existe resposta melhor ou pior: a empresa quer saber como preparar o seu lugar de trabalho.",
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
  {
    codigo: "com-recado",
    categoria: "Comunicação",
    tipo: "dissertativa",
    enunciado: "A reunião da equipe mudou de horário. Escreva a mensagem que você enviaria para avisar todos.",
    opcoes: [],
    orientacao:
      "Escreva a mensagem como se fosse de verdade. Ela precisa dizer:\n1. Que a reunião mudou.\n2. O novo dia e horário.\nPode inventar o horário. Tamanho: de 2 a 4 frases.",
    exemplo: "Bom dia, equipe! A reunião de hoje mudou para amanhã, às 14h. O local continua o mesmo.",
  },
  {
    codigo: "com-retorno",
    categoria: "Comunicação",
    tipo: "multipla_escolha",
    enunciado: "Como você prefere receber uma avaliação sobre o seu trabalho?",
    opcoes: ["Por escrito, com exemplos", "Em conversa só com o líder", "Em reunião com a equipe", "Tanto faz"],
    orientacao:
      "Escolha uma opção. Não existe resposta errada: a empresa quer saber como conversar com você sobre o seu trabalho.",
    exemplo: "",
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
  {
    codigo: "org-interrupcao",
    categoria: "Organização",
    tipo: "dissertativa",
    enunciado: "Você está fazendo uma tarefa e alguém pede ajuda com outra coisa. O que você faz?",
    opcoes: [],
    orientacao: "Explique os passos que você seguiria, em ordem. Não existe uma única resposta certa.",
    exemplo:
      "1. Anoto onde parei. 2. Pergunto se o pedido é urgente. 3. Se for, ajudo e depois volto para a minha tarefa.",
  },
  {
    codigo: "org-planejar",
    categoria: "Organização",
    tipo: "multipla_escolha",
    enunciado: "Como você prefere planejar o seu trabalho?",
    opcoes: [
      "Planejo o dia inteiro logo de manhã",
      "Planejo a semana toda de uma vez",
      "Faço uma tarefa de cada vez",
      "Sigo o plano que o líder me passa",
    ],
    orientacao: "Escolha a opção mais parecida com você. Não existe resposta errada.",
    exemplo: "",
  },
  {
    codigo: "org-materiais",
    categoria: "Organização",
    tipo: "dissertativa",
    enunciado: "Como você organiza os arquivos ou materiais que usa nos estudos ou no trabalho?",
    opcoes: [],
    orientacao:
      "Conte o que você faz para encontrar as coisas rápido. Pode ser com pastas, etiquetas, listas ou outro jeito. Tamanho: de 2 a 4 frases.",
    exemplo: "Separo os arquivos em pastas por mês. Coloco a data no nome de cada arquivo.",
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
  {
    codigo: "prob-erro-proprio",
    categoria: "Resolução de problemas",
    tipo: "dissertativa",
    enunciado: "Você percebeu um erro em uma tarefa que já entregou. O que você faz?",
    opcoes: [],
    orientacao:
      "Descreva os passos, em ordem. Erros acontecem com todo mundo: a empresa quer saber o que você faz depois.",
    exemplo:
      "1. Aviso o responsável. 2. Explico o que aconteceu. 3. Corrijo o erro. 4. Anoto o que fazer para não repetir.",
  },
  {
    codigo: "prob-instrucao",
    categoria: "Resolução de problemas",
    tipo: "multipla_escolha",
    enunciado: "Você recebeu uma tarefa, mas não entendeu uma parte das instruções. O que você faz primeiro?",
    opcoes: [
      "Pergunto para quem passou a tarefa",
      "Procuro a resposta em um manual ou anotação",
      "Peço ajuda a um colega",
      "Faço do jeito que acho certo e aviso depois",
    ],
    orientacao: "Escolha o que você faria primeiro.",
    exemplo: "",
  },
  {
    codigo: "prob-falta",
    categoria: "Resolução de problemas",
    tipo: "dissertativa",
    enunciado: "Para terminar uma tarefa, falta um material ou uma informação. O que você faz?",
    opcoes: [],
    orientacao: "Explique os passos que você seguiria, em ordem.",
    exemplo:
      "1. Vejo exatamente o que falta. 2. Peço ao responsável. 3. Enquanto espero, adianto outra parte da tarefa.",
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
  {
    codigo: "equipe-discordar",
    categoria: "Trabalho em equipe",
    tipo: "dissertativa",
    enunciado: "Você não concordou com a forma como o grupo queria fazer um trabalho. O que você fez ou faria?",
    opcoes: [],
    orientacao: "Conte uma situação real ou diga o que faria. Tamanho: de 2 a 4 frases.",
    exemplo:
      "Expliquei a minha ideia com um exemplo. O grupo escolheu outra forma, e eu fiz a minha parte do jeito combinado.",
  },
  {
    codigo: "equipe-ajudar",
    categoria: "Trabalho em equipe",
    tipo: "dissertativa",
    enunciado: "Conte sobre uma vez em que você ajudou alguém a terminar uma tarefa.",
    opcoes: [],
    orientacao: "Responda nesta ordem:\n1. Quem você ajudou.\n2. O que você fez.\n3. Qual foi o resultado.",
    exemplo: "Ajudei um colega a montar os slides do trabalho. Eu organizei as imagens. Entregamos no prazo.",
  },
  {
    codigo: "equipe-combinar",
    categoria: "Trabalho em equipe",
    tipo: "multipla_escolha",
    enunciado: "Como você prefere combinar as tarefas com a equipe?",
    opcoes: [
      "Em uma lista escrita, com o nome de cada pessoa",
      "Em uma reunião rápida",
      "Por mensagem no grupo",
      "Tanto faz",
    ],
    orientacao: "Escolha uma opção. Não existe resposta errada.",
    exemplo: "",
  },

  // ==================== Por área de trabalho ====================

  // ---------- Administrativo ----------
  {
    codigo: "adm-planilha",
    categoria: "Administrativo",
    tipo: "multipla_escolha",
    enunciado: "Em uma planilha, qual fórmula soma os valores das células A1 até A5?",
    opcoes: ["=SOMA(A1:A5)", "=SOMA(A1;A5)", "=TOTAL(A1-A5)", "=A1+A5"],
    orientacao: "Escolha uma opção. Se não souber, escolha a que achar mais provável.",
    exemplo: "",
  },
  {
    codigo: "adm-documentos",
    categoria: "Administrativo",
    tipo: "dissertativa",
    enunciado: "Você precisa organizar documentos em papel que estão misturados. Como você faria?",
    opcoes: [],
    orientacao: "Descreva os passos em ordem. Pode responder em forma de lista.",
    exemplo: "1. Separo por tipo de documento. 2. Coloco em ordem de data. 3. Guardo em pastas com etiqueta.",
  },
  {
    codigo: "adm-email",
    categoria: "Administrativo",
    tipo: "dissertativa",
    enunciado: "Escreva um e-mail curto pedindo a um fornecedor o orçamento de 50 cadeiras.",
    opcoes: [],
    orientacao:
      "Escreva como se fosse o e-mail de verdade. Inclua:\n1. Uma saudação.\n2. O pedido, com a quantidade.\n3. Até quando você precisa da resposta.\nTamanho: de 3 a 6 frases.",
    exemplo:
      "Bom dia! Gostaríamos de receber o orçamento de 50 cadeiras de escritório. Precisamos da resposta até sexta-feira. Obrigado.",
  },
  {
    codigo: "adm-agenda",
    categoria: "Administrativo",
    tipo: "multipla_escolha",
    enunciado: "Duas reuniões foram marcadas no mesmo horário na agenda do seu líder. O que você faz primeiro?",
    opcoes: [
      "Aviso o líder e pergunto qual reunião é mais importante",
      "Cancelo a reunião marcada por último",
      "Deixo as duas e espero alguém perceber",
      "Mudo o horário das duas sem avisar",
    ],
    orientacao: "Escolha o que você faria primeiro.",
    exemplo: "",
  },
  {
    codigo: "adm-telefone",
    categoria: "Administrativo",
    tipo: "dissertativa",
    enunciado: "Um cliente ligou procurando uma pessoa que não está na empresa agora. O que você fala?",
    opcoes: [],
    orientacao: "Escreva o que você diria, em ordem. Tamanho: de 2 a 4 frases.",
    exemplo:
      "Ela não está no momento. Posso anotar o seu nome, o telefone e o assunto? Peço para ela retornar ainda hoje.",
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
  {
    codigo: "atend-nao-sabe",
    categoria: "Atendimento",
    tipo: "dissertativa",
    enunciado: "Um cliente fez uma pergunta e você não sabe a resposta. O que você faz?",
    opcoes: [],
    orientacao:
      "Explique os passos que você seguiria. Não saber é normal: a empresa quer saber o que você faz nesse caso.",
    exemplo: "1. Digo que vou verificar. 2. Pergunto ao meu líder. 3. Volto com a resposta ou com um prazo.",
  },
  {
    codigo: "atend-fila",
    categoria: "Atendimento",
    tipo: "multipla_escolha",
    enunciado: "Há uma fila de clientes e uma pessoa pede para passar na frente sem ter prioridade. O que você faz?",
    opcoes: [
      "Explico com educação que é preciso seguir a ordem da fila",
      "Atendo essa pessoa primeiro",
      "Não respondo nada",
      "Peço para ela ir embora",
    ],
    orientacao: "Escolha o que você faria.",
    exemplo: "",
  },
  {
    codigo: "atend-chat",
    categoria: "Atendimento",
    tipo: "dissertativa",
    enunciado: "Responda a esta mensagem de um cliente no chat: “Meu pedido chegou com o produto errado.”",
    opcoes: [],
    orientacao:
      "Escreva a resposta como se fosse de verdade. Ela precisa:\n1. Pedir desculpas.\n2. Pedir o número do pedido.\n3. Dizer o que vai acontecer depois.\nTamanho: de 2 a 5 frases.",
    exemplo:
      "Sinto muito pelo problema! Pode me passar o número do pedido? Vamos trocar o produto sem custo para você.",
  },
  {
    codigo: "atend-canal",
    categoria: "Atendimento",
    tipo: "multipla_escolha",
    enunciado: "Em qual forma de atendimento você se sente melhor?",
    opcoes: ["Por mensagem ou chat", "Por telefone", "Pessoalmente", "Por e-mail", "Tanto faz"],
    orientacao: "Escolha uma opção. Não existe resposta errada.",
    exemplo: "",
  },

  // ---------- Vendas e comércio ----------
  {
    codigo: "vendas-troco",
    categoria: "Vendas e comércio",
    tipo: "multipla_escolha",
    enunciado: "Um produto custa R$ 37,50. O cliente paga com uma nota de R$ 50,00. Qual é o troco?",
    opcoes: ["R$ 12,50", "R$ 13,50", "R$ 12,00", "R$ 17,50"],
    orientacao: "Faça a conta e escolha uma opção. Pode usar papel.",
    exemplo: "",
  },
  {
    codigo: "vendas-em-falta",
    categoria: "Vendas e comércio",
    tipo: "dissertativa",
    enunciado: "O cliente quer um produto que acabou na loja. O que você faz?",
    opcoes: [],
    orientacao: "Descreva o que você diria e faria, em ordem.",
    exemplo: "1. Aviso que o produto acabou. 2. Mostro um produto parecido. 3. Ofereço avisar quando o produto chegar.",
  },
  {
    codigo: "vendas-apresentar",
    categoria: "Vendas e comércio",
    tipo: "dissertativa",
    enunciado: "Escolha um produto que você conhece bem e explique por que alguém deveria comprá-lo.",
    opcoes: [],
    orientacao: "Diga:\n1. Qual é o produto.\n2. Duas coisas boas dele.\nTamanho: de 2 a 4 frases.",
    exemplo: "Uma garrafa térmica. Ela mantém a água gelada o dia todo e não vaza na mochila.",
  },
  {
    codigo: "vendas-meta",
    categoria: "Vendas e comércio",
    tipo: "multipla_escolha",
    enunciado: "A meta é vender 120 unidades no mês. Na metade do mês, foram vendidas 50. Quantas unidades faltam?",
    opcoes: ["70", "60", "50", "170"],
    orientacao: "Faça a conta e escolha uma opção. Pode usar papel.",
    exemplo: "",
  },
  {
    codigo: "vendas-reposicao",
    categoria: "Vendas e comércio",
    tipo: "dissertativa",
    enunciado: "Ao repor produtos na prateleira, como você decide quais colocar na frente?",
    opcoes: [],
    orientacao: "Explique o seu jeito de organizar. Pense na data de validade dos produtos. Tamanho: de 1 a 3 frases.",
    exemplo: "Coloco na frente os produtos que vencem antes. Os produtos novos ficam atrás.",
  },

  // ---------- Logística e estoque ----------
  {
    codigo: "log-entrega",
    categoria: "Logística e estoque",
    tipo: "dissertativa",
    enunciado: "Chegou uma entrega de mercadorias. Como você confere se está tudo certo?",
    opcoes: [],
    orientacao: "Descreva os passos em ordem. Pode responder em forma de lista.",
    exemplo:
      "1. Conto as caixas. 2. Comparo os produtos com a nota fiscal. 3. Vejo se algo está danificado. 4. Anoto as diferenças e aviso o responsável.",
  },
  {
    codigo: "log-ordem-saida",
    categoria: "Logística e estoque",
    tipo: "multipla_escolha",
    enunciado: "No estoque, quais produtos devem sair primeiro?",
    opcoes: ["Os que chegaram primeiro", "Os que chegaram por último", "Os que estão mais perto da porta", "Tanto faz"],
    orientacao: "Escolha uma opção. Pense em evitar que os produtos fiquem velhos no estoque.",
    exemplo: "",
  },
  {
    codigo: "log-separacao",
    categoria: "Logística e estoque",
    tipo: "dissertativa",
    enunciado: "Você precisa separar um pedido com 8 itens diferentes. Como você faz para não esquecer nenhum?",
    opcoes: [],
    orientacao: "Explique o que você faria. Pode responder em forma de lista.",
    exemplo: "Uso a lista do pedido e marco cada item quando coloco na caixa. No fim, confiro as quantidades de novo.",
  },
  {
    codigo: "log-contagem",
    categoria: "Logística e estoque",
    tipo: "multipla_escolha",
    enunciado: "Na contagem do estoque, o sistema mostra 40 caixas, mas você contou 37. O que você faz primeiro?",
    opcoes: ["Conto de novo", "Mudo o sistema para 37 sem avisar ninguém", "Deixo como está", "Aviso o cliente"],
    orientacao: "Escolha o que você faria primeiro.",
    exemplo: "",
  },
  {
    codigo: "log-peso",
    categoria: "Logística e estoque",
    tipo: "multipla_escolha",
    enunciado: "Qual é o jeito mais seguro de levantar uma caixa pesada do chão?",
    opcoes: [
      "Dobrar os joelhos e manter as costas retas",
      "Curvar as costas e puxar rápido",
      "Levantar com um braço só",
      "Arrastar a caixa com o pé",
    ],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },

  // ---------- Produção e indústria ----------
  {
    codigo: "prod-procedimento",
    categoria: "Produção e indústria",
    tipo: "multipla_escolha",
    enunciado: "O procedimento diz para desligar a máquina antes de limpar. Você está com pressa. O que você faz?",
    opcoes: [
      "Desligo a máquina antes de limpar",
      "Limpo com a máquina ligada para ganhar tempo",
      "Peço para outra pessoa limpar com ela ligada",
      "Deixo para limpar outro dia",
    ],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },
  {
    codigo: "prod-epi",
    categoria: "Produção e indústria",
    tipo: "dissertativa",
    enunciado: "O que é EPI e para que ele serve?",
    opcoes: [],
    orientacao: "Explique com suas palavras, em 1 a 3 frases. Se souber, cite um exemplo de EPI.",
    exemplo: "",
  },
  {
    codigo: "prod-defeito",
    categoria: "Produção e indústria",
    tipo: "dissertativa",
    enunciado: "Você percebeu que algumas peças estão saindo com defeito da linha de produção. O que você faz?",
    opcoes: [],
    orientacao: "Descreva os passos em ordem.",
    exemplo: "1. Separo as peças com defeito. 2. Aviso o líder. 3. Sigo a orientação dele antes de continuar.",
  },
  {
    codigo: "prod-repeticao",
    categoria: "Produção e indústria",
    tipo: "multipla_escolha",
    enunciado: "Como você se sente fazendo a mesma tarefa várias vezes ao dia?",
    opcoes: [
      "Gosto, porque sei o que esperar",
      "Gosto, se puder fazer pausas",
      "Prefiro tarefas que mudam",
      "Não tenho preferência",
    ],
    orientacao: "Escolha uma opção. Não existe resposta errada.",
    exemplo: "",
  },

  // ---------- Alimentação ----------
  {
    codigo: "alim-higiene",
    categoria: "Alimentação",
    tipo: "dissertativa",
    enunciado: "Antes de começar a preparar alimentos, quais cuidados de higiene você toma?",
    opcoes: [],
    orientacao: "Liste os cuidados, um por linha. Pode ser de 2 a 5 itens.",
    exemplo: "",
  },
  {
    codigo: "alim-validade",
    categoria: "Alimentação",
    tipo: "multipla_escolha",
    enunciado: "Você encontrou um alimento com a data de validade vencida. O que você faz?",
    opcoes: [
      "Separo o alimento e aviso o responsável",
      "Uso, se a aparência estiver boa",
      "Coloco de volta no lugar",
      "Misturo com os outros alimentos",
    ],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },
  {
    codigo: "alim-receita",
    categoria: "Alimentação",
    tipo: "dissertativa",
    enunciado: "A receita usa 2 kg de arroz para 20 pessoas. Quanto arroz é preciso para 30 pessoas? Explique a conta.",
    opcoes: [],
    orientacao: "Mostre o seu raciocínio em 1 ou 2 frases. Pode usar papel.",
    exemplo: "Exemplo com outra conta: se 1 bolo usa 3 ovos, 4 bolos usam 12 ovos, porque 3 × 4 = 12.",
  },
  {
    codigo: "alim-pedidos",
    categoria: "Alimentação",
    tipo: "multipla_escolha",
    enunciado: "Chegaram 3 pedidos ao mesmo tempo na cozinha. Como você decide a ordem de preparo?",
    opcoes: ["Pela ordem de chegada", "Primeiro o mais fácil", "Primeiro o maior", "Pergunto ao líder da cozinha"],
    orientacao: "Escolha o que você faria. A empresa quer entender como você organiza o trabalho.",
    exemplo: "",
  },

  // ---------- Limpeza e conservação ----------
  {
    codigo: "limp-produtos",
    categoria: "Limpeza e conservação",
    tipo: "multipla_escolha",
    enunciado: "Por que não se deve misturar produtos de limpeza diferentes, como água sanitária e desinfetante?",
    opcoes: [
      "Porque a mistura pode soltar gases perigosos",
      "Porque o cheiro fica forte",
      "Porque gasta mais produto",
      "Pode misturar sem problema",
    ],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },
  {
    codigo: "limp-ordem",
    categoria: "Limpeza e conservação",
    tipo: "dissertativa",
    enunciado: "Você precisa limpar uma sala de escritório. Em que ordem você faz as tarefas?",
    opcoes: [],
    orientacao: "Liste as tarefas em ordem, uma por linha.",
    exemplo: "1. Recolho o lixo. 2. Tiro o pó dos móveis. 3. Varro. 4. Passo pano no chão.",
  },
  {
    codigo: "limp-piso",
    categoria: "Limpeza e conservação",
    tipo: "multipla_escolha",
    enunciado: "Depois de lavar o chão de um corredor, o que você faz para evitar que alguém escorregue?",
    opcoes: [
      "Coloco a placa de piso molhado",
      "Nada, o chão seca sozinho",
      "Fecho o prédio inteiro",
      "Jogo pó no chão para secar",
    ],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },
  {
    codigo: "limp-objeto",
    categoria: "Limpeza e conservação",
    tipo: "dissertativa",
    enunciado: "Durante a limpeza, você encontrou uma carteira esquecida em uma mesa. O que você faz?",
    opcoes: [],
    orientacao: "Explique o que você faria, em 1 a 3 frases.",
    exemplo: "Não abro a carteira. Entrego para o responsável ou para o setor de achados e perdidos.",
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
  {
    codigo: "tec-internet",
    categoria: "Tecnologia",
    tipo: "dissertativa",
    enunciado: "Um colega diz que o computador dele não conecta à internet. Quais passos você segue para ajudar?",
    opcoes: [],
    orientacao: "Liste os passos em ordem, do mais simples ao mais difícil.",
    exemplo:
      "1. Vejo se o Wi-Fi está ligado. 2. Testo outro site. 3. Reinicio o roteador. 4. Chamo o suporte se não resolver.",
  },
  {
    codigo: "tec-repeticao",
    categoria: "Tecnologia",
    tipo: "multipla_escolha",
    enunciado: "Em programação, o que faz uma estrutura de repetição, como o for ou o while?",
    opcoes: [
      "Executa um bloco de código várias vezes",
      "Guarda um valor para usar depois",
      "Mostra uma mensagem na tela",
      "Apaga o código",
    ],
    orientacao: "Escolha uma opção. Se não souber, escolha a que achar mais provável.",
    exemplo: "",
  },
  {
    codigo: "tec-git",
    categoria: "Tecnologia",
    tipo: "multipla_escolha",
    enunciado: "Para que serve o Git?",
    opcoes: [
      "Guardar o histórico das mudanças no código",
      "Criar imagens para sites",
      "Hospedar bancos de dados",
      "Editar vídeos",
    ],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },

  // ---------- Finanças ----------
  {
    codigo: "fin-desconto",
    categoria: "Finanças",
    tipo: "multipla_escolha",
    enunciado: "Um produto de R$ 200,00 está com 15% de desconto. Qual é o novo preço?",
    opcoes: ["R$ 170,00", "R$ 185,00", "R$ 150,00", "R$ 215,00"],
    orientacao: "Faça a conta e escolha uma opção. Pode usar papel ou calculadora.",
    exemplo: "",
  },
  {
    codigo: "fin-nota",
    categoria: "Finanças",
    tipo: "dissertativa",
    enunciado: "O valor de uma nota fiscal está diferente do valor do pedido. O que você faz?",
    opcoes: [],
    orientacao: "Descreva os passos em ordem.",
    exemplo:
      "1. Confiro os itens e as quantidades. 2. Vejo onde está a diferença. 3. Aviso o fornecedor ou o responsável antes de pagar.",
  },
  {
    codigo: "fin-gastos",
    categoria: "Finanças",
    tipo: "dissertativa",
    enunciado: "Como você montaria uma planilha para controlar os gastos de um setor?",
    opcoes: [],
    orientacao: "Diga quais colunas a planilha teria e o que mais ela mostraria. Tamanho: de 2 a 4 frases.",
    exemplo: "",
  },
  {
    codigo: "fin-atraso",
    categoria: "Finanças",
    tipo: "multipla_escolha",
    enunciado: "Uma conta vence no dia 10 e foi paga no dia 12. O que costuma acontecer?",
    opcoes: ["Cobram multa e juros pelo atraso", "A conta fica mais barata", "Nada acontece", "A conta é cancelada"],
    orientacao: "Escolha uma opção.",
    exemplo: "",
  },

  // ---------- Marketing e design ----------
  {
    codigo: "mkt-publicacao",
    categoria: "Marketing e design",
    tipo: "dissertativa",
    enunciado: "Escreva o texto de uma publicação para redes sociais anunciando a promoção de uma loja.",
    opcoes: [],
    orientacao:
      "Escreva como se fosse publicar. Inclua:\n1. O que está em promoção.\n2. Até quando vale.\nPode inventar a loja. Tamanho: de 2 a 4 frases.",
    exemplo: "Semana do material escolar! Cadernos com 20% de desconto até domingo. Venha conferir.",
  },
  {
    codigo: "mkt-publico",
    categoria: "Marketing e design",
    tipo: "dissertativa",
    enunciado: "O que é público-alvo? Dê um exemplo.",
    opcoes: [],
    orientacao: "Explique com suas palavras, em 1 a 3 frases, e dê um exemplo.",
    exemplo: "",
  },
  {
    codigo: "mkt-revisao",
    categoria: "Marketing e design",
    tipo: "multipla_escolha",
    enunciado: "Qual destas frases está escrita corretamente?",
    opcoes: [
      "Fazem dois anos que a loja abriu.",
      "Faz dois anos que a loja abriu.",
      "Fazem dois ano que a loja abriu.",
      "Faz dois anos que a loja abriram.",
    ],
    orientacao:
      "Leia com calma cada frase e escolha uma opção. Use esta pergunta só em vagas em que revisar textos faz parte do trabalho.",
    exemplo: "",
  },
  {
    codigo: "mkt-ferramenta",
    categoria: "Marketing e design",
    tipo: "multipla_escolha",
    enunciado: "Qual ferramenta você já usou para criar imagens ou artes?",
    opcoes: ["Canva", "Photoshop ou outro editor profissional", "Figma", "Ainda não usei, mas quero aprender"],
    orientacao: "Escolha a que você mais usou. Não existe resposta errada.",
    exemplo: "",
  },
];
