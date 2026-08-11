-- CreateEnum
CREATE TYPE "SalonRunningStatus" AS ENUM ('ON_TIME', 'DELAYED_10', 'DELAYED_30');

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "runningStatus" "SalonRunningStatus" NOT NULL DEFAULT 'ON_TIME';
