import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateAdminForm } from "./create-admin-form";
import { fraunces } from "@/lib/fonts";

export default async function AdminAdminsPage() {
  const admins = await db.user.findMany({
    where: { isSuperAdmin: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`${fraunces.className} mb-1 text-2xl font-semibold text-stone-900`}>Admins</h1>
        <p className="text-sm text-stone-500">Super admins can approve accounts and salons, and create other super admins.</p>
      </div>

      <CreateAdminForm />

      <div className="rounded-2xl border border-stone-100 bg-white p-2 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.createdAt.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
