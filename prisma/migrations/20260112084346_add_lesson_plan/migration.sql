-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "clusterId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "chapterId" TEXT,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonPlan_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonPlan_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlan_date_clusterId_standard_topic_key" ON "LessonPlan"("date", "clusterId", "standard", "topic");
