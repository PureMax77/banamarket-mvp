-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "kakao_id" TEXT,
    "avatar" TEXT,
    "avatar_thumb" TEXT,
    "ad_agree" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "avatar_thumb", "created_at", "email", "id", "kakao_id", "name", "password", "phone", "updated_at", "username") SELECT "avatar", "avatar_thumb", "created_at", "email", "id", "kakao_id", "name", "password", "phone", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_kakao_id_key" ON "User"("kakao_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
