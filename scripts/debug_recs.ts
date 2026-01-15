
import { prisma } from "../lib/prisma";
import { getClusterTeachingRecommendations } from "../app/actions";

async function main() {
    console.log("Fetching all clusters...");
    const clusters = await prisma.cluster.findMany();

    console.log(`Found ${clusters.length} clusters.`);

    for (const cluster of clusters) {
        console.log(`\n-----------------------------------`);
        console.log(`Cluster: ${cluster.name} (ID: ${cluster.id})`);
        try {
            const recs = await getClusterTeachingRecommendations(cluster.id);
            console.log(`Recommendations found: ${recs.length}`);
            if (recs.length > 0) {
                recs.forEach((r, idx) => {
                    console.log(`  ${idx + 1}. Standard: ${r.standard} | Subject: ${r.recommendation?.subject} | Topic: ${r.recommendation?.subtopic}`);
                });
            } else {
                console.log("  No recommendations found.");
            }
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
