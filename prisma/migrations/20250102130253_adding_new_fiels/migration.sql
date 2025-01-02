/*
  Warnings:

  - Changed the type of `releaseYear` on the `Album` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Album" ALTER COLUMN "coverArt" DROP NOT NULL,
DROP COLUMN "releaseYear",
ADD COLUMN     "releaseYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
