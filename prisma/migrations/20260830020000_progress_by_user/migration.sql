-- DropIndex
DROP INDEX "game_sessions_sessionToken_key";

-- AlterTable: quitar el token anónimo; el progreso se vincula al usuario autenticado
ALTER TABLE "game_sessions" DROP COLUMN "sessionToken";
