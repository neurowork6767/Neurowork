import { onlyDigits } from "@/lib/masks";

/**
 * Links de envio pelo WhatsApp e pelo e-mail.
 *
 * Os links abrem o WhatsApp ou o programa de e-mail de quem está usando o painel, já com a
 * mensagem e o link da vaga. Nada é enviado sozinho: a pessoa confere o texto e envia.
 * Assim o sistema não precisa de um serviço pago de envio (API do WhatsApp Business ou de e-mail)
 * nem de chaves secretas.
 */

export type DadosDaVaga = { titulo: string; empresaNome: string; link: string };

/** Converte um telefone brasileiro para o formato do WhatsApp: 55 + DDD + número. */
export function telefoneParaWhatsApp(telefone: string): string | null {
  const digitos = onlyDigits(telefone);
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if (digitos.startsWith("55") && (digitos.length === 12 || digitos.length === 13)) return digitos;
  return null;
}

/** Sem telefone, o WhatsApp abre para a pessoa escolher o contato. */
export function linkWhatsApp(mensagem: string, telefone?: string): string {
  const numero = telefone ? telefoneParaWhatsApp(telefone) : null;
  return `https://wa.me/${numero ?? ""}?text=${encodeURIComponent(mensagem)}`;
}

export function linkEmail({
  para = "",
  assunto,
  mensagem,
}: {
  para?: string;
  assunto: string;
  mensagem: string;
}): string {
  return `mailto:${para.trim()}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
}

function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0];
}

/** Convite para se candidatar, enviado pela tela da vaga. Frases curtas e diretas. */
export function mensagemConvite({ titulo, empresaNome, link }: DadosDaVaga, nome = ""): string {
  return [
    nome.trim() ? `Olá, ${primeiroNome(nome)}!` : "Olá!",
    `A empresa ${empresaNome} convida você para a vaga ${titulo}.`,
    "Para se candidatar, abra o link abaixo. Não é preciso criar conta e a avaliação não tem limite de tempo.",
    "Antes de começar, você pode escolher ajustes que ajudam, como ver uma pergunta por tela ou ouvir as perguntas.",
    link,
  ].join("\n\n");
}

/** Mensagem para quem já se candidatou, enviada ao telefone e ao e-mail que o candidato cadastrou. */
export function mensagemCandidato({ titulo, empresaNome, link }: DadosDaVaga, nome: string): string {
  return [
    `Olá, ${primeiroNome(nome)}!`,
    `Aqui é da empresa ${empresaNome}, sobre a sua candidatura para a vaga ${titulo}.`,
    `Link da vaga: ${link}`,
    "Se tiver alguma dúvida, é só responder esta mensagem.",
  ].join("\n\n");
}

export const assuntoConvite = (titulo: string) => `Convite para a vaga ${titulo}`;
export const assuntoCandidato = (titulo: string) => `Sua candidatura para a vaga ${titulo}`;
