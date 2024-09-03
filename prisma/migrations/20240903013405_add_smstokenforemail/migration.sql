-- CreateTable
CREATE TABLE "SMSTokenForEmail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "count" INTEGER NOT NULL DEFAULT 0,
    "token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "SMSTokenForEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SMSTokenForEmail_userId_key" ON "SMSTokenForEmail"("userId");
