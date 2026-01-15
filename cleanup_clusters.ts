import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up duplicate clusters...')

    // The duplicates we want to remove are the ones where ID matches the Name 
    // (Seed, Sapling, Plant, Tree) as they don't have student associations 
    // based on our previous check.

    const duplicates = ['Seed', 'Sapling', 'Plant', 'Tree']

    const result = await prisma.cluster.deleteMany({
        where: {
            id: {
                in: duplicates
            }
        }
    })

    console.log(`Deleted ${result.count} duplicate clusters.`)
    await prisma.$disconnect()
}

main().catch(console.error)
