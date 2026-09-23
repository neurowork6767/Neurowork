import type { Plano } from "@/types";

/** Valores de referência para a simulação (o Pro corresponde ao ticket usado no SAM). */
export const PLANOS: Plano[] = [
  {
    id: "basic",
    nome: "Basic",
    precoMensal: 149,
    descricao: "Para empresas começando a estruturar processos inclusivos.",
    limiteVagas: 3,
    recursos: [
      "Até 3 vagas ativas",
      "Link de candidatura sem cadastro",
      "Avaliações adaptadas",
      "Painel de candidatos",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    precoMensal: 299,
    descricao: "Para empresas com processos seletivos frequentes.",
    limiteVagas: 10,
    recursos: ["Até 10 vagas ativas", "Tudo do Basic", "Relatórios por vaga", "Suporte prioritário"],
    destaque: true,
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    precoMensal: 599,
    descricao: "Para grandes empresas e equipes de RH/D&I.",
    limiteVagas: null,
    recursos: ["Vagas ilimitadas", "Tudo do Pro", "Relatórios para a Lei de Cotas", "Onboarding assistido"],
  },
];
