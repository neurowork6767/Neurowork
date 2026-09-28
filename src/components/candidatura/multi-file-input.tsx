"use client";

import * as React from "react";
import { FileText, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE_MB } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";

type MultiFileInputProps = {
  id: string;
  value?: File[];
  max: number;
  onChange: (files: File[]) => void;
  onBlur?: () => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Seleção de vários PDFs (certificados, RF-08), com lista e botão de remover cada um. */
export function MultiFileInput({ id, value = [], max, onChange, onBlur, ...aria }: MultiFileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cheio = value.length >= max;

  function adicionar(lista: FileList | null) {
    if (!lista) return;
    onChange([...value, ...Array.from(lista)].slice(0, max));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{file.name}</span>
                <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <X aria-hidden="true" />
                Remover
                <span className="sr-only"> {file.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!cheio && (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card p-4 font-medium hover:bg-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
        >
          <Plus className="size-5 text-primary" aria-hidden="true" />
          {value.length === 0 ? "Adicionar certificados em PDF" : "Adicionar mais um certificado"}
          <span className="font-normal text-muted-foreground">
            (até {max}, {MAX_FILE_SIZE_MB} MB cada)
          </span>
          <input
            ref={inputRef}
            id={id}
            type="file"
            multiple
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => adicionar(e.target.files)}
            onBlur={onBlur}
            {...aria}
          />
        </label>
      )}
    </div>
  );
}
