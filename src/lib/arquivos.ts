import type { ArquivoEnviado } from "@/types";

/** Lê o PDF escolhido pelo candidato e devolve o conteúdo em base64, pronto para guardar no banco. */
export function lerArquivo(arquivo: File): Promise<ArquivoEnviado> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      // O resultado vem como "data:application/pdf;base64,AAAA…"; guardamos só a parte depois da vírgula
      const conteudo = String(leitor.result).split(",")[1] ?? "";
      resolve({ nome: arquivo.name, tamanho: arquivo.size, conteudo });
    };
    leitor.onerror = () => reject(new Error(`Não foi possível ler o arquivo "${arquivo.name}".`));
    leitor.readAsDataURL(arquivo);
  });
}

/**
 * Mostra o PDF numa aba nova. A aba é aberta antes de buscar o arquivo (no clique),
 * porque o navegador bloqueia abas abertas depois de uma espera.
 * Sem a aba (bloqueador de pop-up), o PDF é baixado.
 */
export async function mostrarPdf(nome: string, conteudo: string, aba: Window | null) {
  // Converte o base64 de volta para o arquivo PDF
  const pdf = await (await fetch(`data:application/pdf;base64,${conteudo}`)).blob();
  const url = URL.createObjectURL(pdf);

  if (aba) {
    aba.location.href = url;
  } else {
    const link = document.createElement("a");
    link.href = url;
    link.download = nome;
    link.click();
  }
  // Libera a memória depois que o navegador já abriu o arquivo
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
