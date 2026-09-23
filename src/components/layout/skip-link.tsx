/** Link "Pular para o conteúdo": aparece ao navegar com Tab (FE03). */
export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      Pular para o conteúdo
    </a>
  );
}
