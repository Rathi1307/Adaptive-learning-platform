import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Starting Recommendation Diagnosis ---");

    const cluster = await prisma.cluster.findFirst({
        include: { students: true }
    });

    if (!cluster) {
        console.error("No cluster found. Please seed the database.");
        return;
    }

    console.log(`Testing with Cluster: ${cluster.name} (${cluster.id})`);

    const students = cluster.students || [];
    const standards = [...new Set(students.map(s => s.standard).filter(Boolean))] as string[];
    console.log(`Standards for this cluster: ${standards.join(', ')}`);

    if (standards.length === 0) {
        console.log("No standards found for this cluster. Cannot generate recommendations.");
        return;
    }

    // Check taught records
    const taught = await prisma.taughtSubtopic.findMany({
        where: { clusterId: cluster.id }
    });
    console.log(`Found ${taught.length} taught subtopic records.`);

    // Simulate recommendation logic for first standard
    const std = standards[0];
    const courses = await prisma.course.findMany({
        where: { standard: std },
        include: {
            modules: {
                include: {
                    chapters: { orderBy: { id: 'asc' } }
                }
            }
        }
    });

    console.log(`Found ${courses.length} courses for Class ${std}.`);

    if (courses.length > 0) {
        const firstCourse = courses[0];
        const allSubtopics = firstCourse.modules.flatMap(m =>
            m.chapters.flatMap(c => {
                const subs = JSON.parse(c.subtopics || '[]');
                return subs.map((s: string) => ({ chapterId: c.id, chapterTitle: c.title, subtopic: s }));
            })
        );

        console.log(`Total subtopics in ${firstCourse.title}: ${allSubtopics.length}`);

        const nextSubtopic = allSubtopics.find(s =>
            !taught.some(t => t.chapterId === s.chapterId && t.subtopic === s.subtopic && t.standard === std)
        );

        if (nextSubtopic) {
            console.log(`Recommendation SUCCESS: Next subtopic is "${nextSubtopic.subtopic}" from chapter "${nextSubtopic.chapterTitle}"`);
        } else {
            console.log("Recommendation: Syllabus complete for this standard.");
        }
    }

    console.log("--- Diagnosis Complete ---");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
