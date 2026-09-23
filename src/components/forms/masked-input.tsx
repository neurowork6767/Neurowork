"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { masks, type MaskName } from "@/lib/masks";

type MaskedInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  mask: MaskName;
  value?: string;
  onChange: (value: string) => void;
};

/**
 * Campo com máscara de entrada (CNPJ, telefone, moeda).
 * Usado com o Controller do React Hook Form: recebe e devolve o texto já formatado.
 */
export function MaskedInput({ mask, value = "", onChange, inputMode, ...props }: MaskedInputProps) {
  return (
    <Input
      {...props}
      inputMode={inputMode ?? "numeric"}
      value={value}
      onChange={(event) => onChange(masks[mask](event.target.value))}
    />
  );
}
