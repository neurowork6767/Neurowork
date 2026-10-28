"use client";

import * as React from "react";
import { Mail, MessageCircle } from "lucide-react";

import { FormField } from "@/components/forms/form-field";
import { MaskedInput } from "@/components/forms/masked-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  assuntoConvite,
  linkEmail,
  linkWhatsApp,
  mensagemConvite,
  telefoneParaWhatsApp,
  type DadosDaVaga,
} from "@/lib/mensagens";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Envia o link da vaga para um candidato pelo WhatsApp ou pelo e-mail, com a mensagem pronta. */
export function EnviarLinkVaga({ vaga, idBase }: { vaga: DadosDaVaga; idBase: string }) {
  const [nome, setNome] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState("");

  const telefoneInvalido = telefone !== "" && telefoneParaWhatsApp(telefone) === null;
  const emailInvalido = email.trim() !== "" && !EMAIL_VALIDO.test(email.trim());

  const mensagem = mensagemConvite(vaga, nome);
  const hrefWhatsApp = linkWhatsApp(mensagem, telefone || undefined);
  const hrefEmail = linkEmail({ para: email, assunto: assuntoConvite(vaga.titulo), mensagem });

  return (
    <section aria-labelledby={`${idBase}-titulo`} className="space-y-4 border-t pt-5">
      <div className="space-y-1">
        <h3 id={`${idBase}-titulo`} className="font-semibold">
          Enviar para um candidato
        </h3>
        <p className="text-sm text-muted-foreground">
          Abre o seu WhatsApp ou e-mail com a mensagem e o link prontos. Você confere o texto e envia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={`${idBase}-nome`} label="Nome do candidato">
          {(field) => <Input {...field} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />}
        </FormField>
        <FormField
          id={`${idBase}-whatsapp`}
          label="WhatsApp com DDD"
          hint="Em branco, você escolhe o contato no WhatsApp."
          error={telefoneInvalido ? "Digite o celular com DDD, como (11) 91234-5678." : undefined}
        >
          {(field) => (
            <MaskedInput
              {...field}
              mask="phone"
              type="tel"
              autoComplete="off"
              placeholder="(11) 91234-5678"
              value={telefone}
              onChange={setTelefone}
            />
          )}
        </FormField>
        <FormField
          id={`${idBase}-email`}
          label="E-mail"
          error={emailInvalido ? "Digite um e-mail válido, como nome@email.com." : undefined}
        >
          {(field) => (
            <Input
              {...field}
              type="email"
              autoComplete="off"
              placeholder="nome@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {telefoneInvalido ? (
          <Button type="button" disabled>
            <MessageCircle aria-hidden="true" />
            Enviar pelo WhatsApp
          </Button>
        ) : (
          <Button asChild>
            <a href={hrefWhatsApp} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" />
              Enviar pelo WhatsApp
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </Button>
        )}
        {emailInvalido ? (
          <Button type="button" variant="outline" disabled>
            <Mail aria-hidden="true" />
            Enviar por e-mail
          </Button>
        ) : (
          <Button asChild variant="outline">
            <a href={hrefEmail}>
              <Mail aria-hidden="true" />
              Enviar por e-mail
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
