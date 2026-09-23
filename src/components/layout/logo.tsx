import Link from "next/link";
import { BrainCircuit } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 rounded-md font-bold text-navy", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
        <BrainCircuit className="size-5" />
      </span>
      <span className="text-lg tracking-tight">NeuroWork</span>
    </Link>
  );
}
