import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Política de privacidade",
};

const SECOES = [
  {
    titulo: "Quais dados coletamos",
    itens: [
      "Da empresa: nome, CNPJ, pessoa responsável, e-mail e telefone.",
      "Do candidato: nome, e-mail, telefone, cidade, currículo e, se quiser, portfólio e certificados.",
      "Respostas às perguntas da avaliação da vaga.",
      "Se o candidato quiser, uma descrição das adaptações que o ajudam.",
    ],
  },
  {
    titulo: "O que NÃO coletamos",
    itens: [
      "Não pedimos, não deduzimos e não registramos diagnósticos ou laudos.",
      "O candidato não precisa criar conta nem senha.",
    ],
  },
  {
    titulo: "Para que usamos os dados",
    itens: [
      "Somente para o processo seletivo da vaga em que a pessoa se candidatou.",
      "A empresa da vaga é a única que vê a candidatura.",
      "Não vendemos nem compartilhamos dados com outras empresas.",
      "Os ajustes escolhidos para a avaliação só são mostrados à empresa se o candidato permitir. A condição escolhida no atalho nunca é salva.",
    ],
  },
  {
    titulo: "Seus direitos (LGPD, art. 18)",
    itens: [
      "Saber quais dados seus estão guardados.",
      "Corrigir dados incompletos ou errados.",
      "Excluir seus dados: logo após enviar, pelo botão “Excluir minha candidatura”; depois, pedindo à empresa da vaga, que exclui pelo painel.",
      "Retirar o consentimento a qualquer momento.",
    ],
  },
  {
    titulo: "Como os dados serão protegidos (versão final)",
    itens: [
      "Acesso aos dados só com login da empresa responsável pela vaga.",
      "Regras de segurança no banco de dados para impedir acesso de terceiros.",
      "Conexão criptografada (HTTPS).",
    ],
  },
];

/** Política de privacidade em linguagem simples (LGPD — Lei 13.709/2018). */
export default function PrivacidadePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="mb-3 text-3xl font-extrabold text-navy">Política de privacidade</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Explicamos aqui, de forma simples, como a NeuroWork trata os dados de empresas e candidatos, conforme a Lei
          Geral de Proteção de Dados (Lei 13.709/2018).
        </p>

        <div className="space-y-5">
          {SECOES.map((secao) => (
            <Card key={secao.titulo}>
              <CardContent className="space-y-3 pt-6">
                <h2 className="text-xl font-bold text-navy">{secao.titulo}</h2>
                <ul className="list-disc space-y-1.5 pl-5">
                  {secao.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 rounded-lg border bg-secondary p-4 text-secondary-foreground">
          Esta é a versão de demonstração do Trabalho de Conclusão de Curso. Os dados de exemplo ficam salvos apenas no
          seu navegador.
        </p>
      </main>
    </>
  );
}
