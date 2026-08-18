"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSuperAdmin } from "@/lib/actions/admin";

const inputClassName = "rounded-xl border-2 border-stone-200 focus-visible:border-[#7C2D3E] focus-visible:ring-[#7C2D3E]/20";

export function CreateAdminForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await createSuperAdmin({ name, email, password });
    setSubmitting(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${email} is now a super admin`);
    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="admin-name">Name</Label>
        <Input id="admin-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClassName}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClassName}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create super admin"}
      </button>
    </form>
  );
}
