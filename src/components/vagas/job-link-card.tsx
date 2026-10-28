"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLinkDaVaga } from "@/lib/services";
import { EnviarLinkVaga } from "./enviar-link-vaga";

type JobLinkCardProps = {
  slug: string;
  disabled?: boolean;
  /** Com o título da vaga e o nome da empresa, o cartão também envia o link pelo WhatsApp ou e-mail */
  vagaTitulo?: string;
  empresaNome?: string;
};

/** Mostra, copia e envia o link público da vaga (FE09) */
export function JobLinkCard({ slug, disabled = false, vagaTitulo, empresaNome }: JobLinkCardProps) {
  const [link, setLink] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLink(getLinkDaVaga(slug));
  }, [slug]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Navegadores sem permissão de área de transferência: seleciona o texto para o usuário copiar
      inputRef.current?.select();
      toast.info("Selecionamos o link. Use Ctrl+C para copiar.");
      return;
    }
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2">
          <Link2 className="size-5 text-primary" aria-hidden="true" />
          Link para candidatos
        </CardTitle>
        <CardDescription>
          {disabled
            ? "A vaga está encerrada: o link mostra um aviso e não aceita novas candidaturas."
            : "Envie este link. O candidato se candidata sem criar conta."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor={`link-${slug}`} className="sr-only">
            Link da vaga
          </label>
          <Input id={`link-${slug}`} ref={inputRef} value={link} readOnly onFocus={(e) => e.target.select()} />
          <div className="flex gap-2">
            <Button type="button" onClick={handleCopy} disabled={!link} className="flex-1 sm:flex-none">
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button asChild variant="outline" size="icon">
              <Link
                href={`/vaga/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir página da vaga em nova aba"
              >
                <ExternalLink aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {!disabled && link && vagaTitulo && empresaNome && (
          <EnviarLinkVaga idBase={`enviar-${slug}`} vaga={{ titulo: vagaTitulo, empresaNome, link }} />
        )}
      </CardContent>
    </Card>
  );
}
