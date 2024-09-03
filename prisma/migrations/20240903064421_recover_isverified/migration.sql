-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SMSTokenForEmail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "count" INTEGER NOT NULL DEFAULT 0,
    "token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "SMSTokenForEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SMSTokenForEmail" ("count", "created_at", "id", "token", "updated_at", "userId") SELECT "count", "created_at", "id", "token", "updated_at", "userId" FROM "SMSTokenForEmail";
DROP TABLE "SMSTokenForEmail";
ALTER TABLE "new_SMSTokenForEmail" RENAME TO "SMSTokenForEmail";
CREATE UNIQUE INDEX "SMSTokenForEmail_userId_key" ON "SMSTokenForEmail"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
