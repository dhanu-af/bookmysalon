-- CreateEnum
CREATE TYPE "SalonSubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "SalonSubscription" ADD COLUMN     "status" "SalonSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "advancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceCentsMonthly" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smsEnabled" BOOLEAN NOT NULL DEFAULT false;
