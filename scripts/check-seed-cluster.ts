
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const seedCluster = await prisma.cluster.findUnique({
        where: { name: 'Seed' },
        include: { students: true }
    })

    if (!seedCluster) {
        console.log('Seed cluster not found')
        return
    }

    console.log('Seed Cluster ID:', seedCluster.id)
    console.log('Student Count:', seedCluster.students.length)
    seedCluster.students.forEach(s => {
        console.log(`- ${s.name} (Standard: ${s.standard})`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
