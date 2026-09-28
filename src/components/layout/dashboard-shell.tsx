"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  CreditCard,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { LoadingState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSessao, logout, restaurarDadosDeExemplo } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { Sessao } from "@/types";
import { Logo } from "@/components/brand/logo";
import { SkipLink } from "./skip-link";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/painel", label: "Início", icon: LayoutDashboard },
  { href: "/painel/vagas", label: "Vagas", icon: Briefcase },
  { href: "/painel/candidatos", label: "Candidatos", icon: Users },
  { href: "/painel/plano", label: "Plano", icon: CreditCard },
  { href: "/painel/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/painel/empresa", label: "Minha empresa", icon: Building2 },
];

function isActive(pathname: string, href: string) {
  return href === "/painel" ? pathname === href : pathname.startsWith(href);
}

/** tone "dark": menu lateral azul-marinho (desktop); "light": menu do celular. */
function NavLinks({ onNavigate, tone = "light" }: { onNavigate?: () => void; tone?: "light" | "dark" }) {
  const pathname = usePathname() ?? "";
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 font-medium transition-colors",
                tone === "dark"
                  ? active
                    ? "bg-white text-navy"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                  : active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ResetDataButton({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = React.useState(false);

  function handleReset() {
    restaurarDadosDeExemplo();
    setOpen(false);
    toast.success("Dados de exemplo restaurados.");
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start",
            tone === "dark" ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground"
          )}
        >
          <Database aria-hidden="true" />
          Restaurar dados de exemplo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restaurar dados de exemplo?</DialogTitle>
          <DialogDescription>
            Vagas, candidaturas e contas criadas neste navegador serão apagadas e os dados iniciais voltarão.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleReset}>
            Restaurar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Estrutura do painel da empresa (FE06): menu lateral, cabeçalho e proteção de rota.
 * Sem sessão, o usuário é enviado para o login.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sessao, setSessao] = React.useState<Sessao | null>(null);
  const [checking, setChecking] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const current = getSessao();
    if (!current) {
      router.replace("/login");
      return;
    }
    setSessao(current);
    setChecking(false);
  }, [router]);

  function handleLogout() {
    logout();
    toast.success("Você saiu da sua conta.");
    router.push("/login");
  }

  if (checking || !sessao) {
    return <LoadingState label="Verificando acesso…" className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <SkipLink />

      <aside className="hidden bg-navy text-white lg:flex lg:flex-col" aria-label="Menu do painel">
        <div className="flex h-16 items-center px-5">
          <Logo href="/painel" tone="inverse" />
        </div>
        <div className="brand-gradient mx-5 h-0.5 rounded-full" data-decorative aria-hidden="true" />
        <nav aria-label="Seções do painel" className="flex-1 p-3 pt-5">
          <NavLinks tone="dark" />
        </nav>
        <div className="border-t border-white/15 p-3">
          <ResetDataButton tone="dark" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent side="left" className="flex flex-col p-4">
                <DialogTitle className="sr-only">Menu do painel</DialogTitle>
                <DialogDescription className="sr-only">Navegue entre as seções do painel.</DialogDescription>
                <div className="mb-6 mt-1">
                  <Logo href="/painel" />
                </div>
                <nav aria-label="Seções do painel" className="flex-1">
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </nav>
                <ResetDataButton />
              </DialogContent>
            </Dialog>
            <div className="lg:hidden">
              <Logo href="/painel" />
            </div>
            <p className="hidden truncate font-medium lg:block">{sessao.nome}</p>
          </div>

          <div className="flex items-center gap-2">
            <AccessibilityMenu />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
              <span className="sr-only sm:hidden">Sair</span>
            </Button>
          </div>
        </header>

        <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
