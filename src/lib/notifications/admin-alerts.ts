import "server-only";
import { db } from "@/lib/db";
import { sendEmail } from "./email";

/**
 * Fired right after a self-service signup (customer or salon owner) creates
 * a PENDING account — emails every current super admin so they know there's
 * something waiting at /admin/approvals, rather than requiring them to check
 * the page proactively.
 */
export async function notifyAdminsOfPendingUser(userId: string) {
  const [user, admins] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { staffMemberships: { where: { role: "OWNER" }, include: { salon: true } } },
    }),
    db.user.findMany({ where: { isSuperAdmin: true } }),
  ]);
  if (!user || admins.length === 0) return { sent: false, error: "No user or no admins to notify" };

  const ownedSalon = user.staffMemberships[0]?.salon;
  const kind = ownedSalon ? "salon owner" : "customer";
  const subject = ownedSalon
    ? `New salon owner signup: ${ownedSalon.name} — approval needed`
    : `New customer signup — approval needed`;
  const html = `<p>A new ${kind} account is pending your approval.</p>
<p><strong>${user.name ?? user.email}</strong> (${user.email})${ownedSalon ? ` — salon: <strong>${ownedSalon.name}</strong>` : ""}</p>
<p><a href="${process.env.NEXTAUTH_URL ?? "https://bookmysalon-nu.vercel.app"}/admin/approvals">Review in Approvals →</a></p>`;

  const results = await Promise.all(
    admins.map(async (admin) => {
      const notification = await db.notification.create({
        data: { userId: admin.id, channel: "EMAIL", type: "ADMIN_ALERT", status: "PENDING" },
      });
      const result = await sendEmail({ to: admin.email, subject, html });
      await db.notification.update({
        where: { id: notification.id },
        data: { status: result.sent ? "SENT" : "FAILED", sentAt: result.sent ? new Date() : null, payload: result.error ? { error: result.error } : undefined },
      });
      return result;
    })
  );

  return { sent: results.some((r) => r.sent) };
}
