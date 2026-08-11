import type { SalonRunningStatus } from "@/generated/prisma/client";

export const RUNNING_STATUS_LABELS: Record<SalonRunningStatus, string> = {
  ON_TIME: "🟢 On time",
  DELAYED_10: "🟡 Running ~10 min late",
  DELAYED_30: "🔴 Running ~30 min late",
};
