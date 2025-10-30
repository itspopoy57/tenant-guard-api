-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "note" TEXT,
ADD COLUMN     "pros" TEXT[] DEFAULT ARRAY[]::TEXT[];
