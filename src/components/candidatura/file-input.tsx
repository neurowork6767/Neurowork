"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE_MB } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";

type FileInputProps = {
  id: string;
  value?: File;
  onChange: (file: File | undefined) => void;
  onBlur?: () => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

/**
 * Seleção de arquivo PDF (FE17). Nesta versão o arquivo não é enviado:
 * só validamos tipo e tamanho e guardamos o nome.
 */
export function FileInput({ id, value, onChange, onBlur, ...aria }: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="size-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{value.name}</p>
          <p className="text-sm text-muted-foreground">{formatFileSize(value.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange(undefined);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          <X aria-hidden="true" />
          Remover
          <span className="sr-only"> {value.name}</span>
        </Button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed bg-card p-6 text-center hover:bg-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
    >
      <Upload className="size-6 text-primary" aria-hidden="true" />
      <span className="font-medium">Escolher arquivo PDF</span>
      <span className="text-sm text-muted-foreground">Até {MAX_FILE_SIZE_MB} MB</span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0])}
        onBlur={onBlur}
        {...aria}
      />
    </label>
  );
}
