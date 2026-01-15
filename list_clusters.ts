import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const clusters = await prisma.cluster.findMany({
        include: {
            _count: {
                select: { students: true }
            }
        }
    })
    console.log(JSON.stringify(clusters, null, 2))
    await prisma.$disconnect()
}

main().catch(console.error)
