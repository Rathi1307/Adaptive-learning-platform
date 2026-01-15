
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getClusterTeachingRecommendations(clusterId) {
    const cluster = await prisma.cluster.findUnique({
        where: { id: clusterId },
        include: {
            students: true
        }
    });

    if (!cluster) throw new Error("Cluster not found");

    // Dynamic standards from students vs schedule
    let standards = [];

    // Prioritize schedule standards if they exist
    if (cluster.schedule) {
        try {
            const sched = JSON.parse(cluster.schedule);
            if (sched.segments) {
                standards = sched.segments
                    .map((s) => s.standard)
                    .filter(Boolean)
                    .map((s) => s.replace(/Class\s+/i, "").trim());
                // Remove duplicates
                standards = [...new Set(standards)];
            }
        } catch (e) {
            console.error("Failed to parse schedule for standards:", e);
        }
    }

    // If no standards from schedule, fall back to students
    if (standards.length === 0) {
        standards = [...new Set((cluster.students || []).map(s => s.standard).filter(Boolean))];
    }

    console.log(`Cluster: ${cluster.name}, Standards detected:`, standards);

    // If still no standards, log but don't crash
    if (standards.length === 0) {
        console.log(`[getClusterTeachingRecommendations] No standards found for cluster ${clusterId}.`);
        return [];
    }

    const recommendations = [];

    for (const std of standards) {
        // Find the next untaught subtopic for this standard
        const courses = await prisma.course.findMany({
            where: { standard: std },
            include: {
                modules: {
                    include: {
                        chapters: {
                            orderBy: { id: 'asc' } // Simple ordering
                        }
                    }
                }
            }
        });

        console.log(`  Standard ${std}: Found ${courses.length} courses.`);

        // Get taught subtopics for this cluster and standard
        const taughtRecords = await prisma.taughtSubtopic.findMany({
            where: { clusterId, standard: std },
        });

        const taughtKeys = new Set(taughtRecords.map((r) => `${r.chapterId}:${r.subtopic}`));

        let nextTopic = null;

        outerLoop:
        for (const course of courses) {
            for (const mod of course.modules) {
                for (const chapter of mod.chapters) {
                    const subtopics = JSON.parse(chapter.subtopics || "[]");
                    for (const sub of subtopics) {
                        if (!taughtKeys.has(`${chapter.id}:${sub}`)) {
                            nextTopic = {
                                standard: std,
                                subject: course.title,
                                chapterId: chapter.id,
                                chapterTitle: chapter.title,
                                subtopic: sub
                            };
                            break outerLoop;
                        }
                    }
                }
            }
        }

        if (nextTopic) {
            console.log(`  Found topic for ${std}: ${nextTopic.subtopic}`);
        } else {
            console.log(`  NO topic found for ${std} (checked ${courses.length} courses)`);
        }

        // FALLBACK: If no topic found in DB, provide sample data
        if (!nextTopic) {
            const sampleSyllabus = [
                { id: 'S1', title: 'Intro to Concept', subtopic: 'Basic Fundamentals' },
                { id: 'S2', title: 'Advanced Theory', subtopic: 'Practical Applications' },
                { id: 'S3', title: 'Deep Dive', subtopic: 'Problem Solving' },
                { id: 'S4', title: 'Final Review', subtopic: 'Exam Preparation' }
            ];

            for (const sample of sampleSyllabus) {
                if (!taughtKeys.has(`SAMPLE:${sample.subtopic}`)) {
                    nextTopic = {
                        standard: std,
                        subject: "General Subject",
                        chapterId: "SAMPLE",
                        chapterTitle: sample.title,
                        subtopic: sample.subtopic
                    };
                    break;
                }
            }
            console.log(`  Using fallback for ${std}: ${nextTopic.subtopic}`);
        }

        recommendations.push({
            standard: std,
            recommendation: nextTopic
        });
    }

    return recommendations;
}

async function main() {
    console.log("Fetching all clusters...");
    const clusters = await prisma.cluster.findMany();

    console.log(`Found ${clusters.length} clusters.`);

    for (const cluster of clusters) {
        console.log(`\n-----------------------------------`);
        console.log(`Cluster: ${cluster.name} (ID: ${cluster.id})`);
        try {
            const recs = await getClusterTeachingRecommendations(cluster.id);
            console.log(`Recommendations count: ${recs.length}`);
        } catch (error) {
            console.error(`  Error fetching recommendations:`, error);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
