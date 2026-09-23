import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader showAuthLinks={false} />
      <main id="conteudo" className="mx-auto flex w-full max-w-lg flex-col px-4 py-10 sm:py-16">
        {children}
      </main>
    </>
  );
}
