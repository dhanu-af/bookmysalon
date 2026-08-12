"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" className={cn("gap-2", className)} onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
