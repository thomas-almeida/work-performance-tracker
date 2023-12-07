/*
  Warnings:

  - Made the column `userId` on table `Daily` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dailyId` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dailyId` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Daily" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Daily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Daily" ("day", "id", "userId") SELECT "day", "id", "userId" FROM "Daily";
DROP TABLE "Daily";
ALTER TABLE "new_Daily" RENAME TO "Daily";
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "dailyId" INTEGER NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_dailyId_fkey" FOREIGN KEY ("dailyId") REFERENCES "Daily" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("dailyId", "deadline", "description", "id", "name", "userId", "xp") SELECT "dailyId", "deadline", "description", "id", "name", "userId", "xp" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "dailyId" INTEGER NOT NULL,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_dailyId_fkey" FOREIGN KEY ("dailyId") REFERENCES "Daily" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("content", "dailyId", "id", "title", "userId", "xp") SELECT "content", "dailyId", "id", "title", "userId", "xp" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
