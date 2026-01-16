
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const seedCluster = await prisma.cluster.findUnique({
        where: { name: 'Seed' }
    })

    if (!seedCluster) {
        console.log('Seed cluster not found')
        return
    }

    const hashedPassword = await hash('password123', 10)

    // define students
    const students = [
        { name: 'Seed Student C1', email: 'seed1@student.com', standard: '1' },
        { name: 'Seed Student C2', email: 'seed2@student.com', standard: '2' },
        { name: 'Seed Student C3', email: 'seed3@student.com', standard: '3' },
    ]

    for (const s of students) {
        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: {
                clusterId: seedCluster.id,
                standard: s.standard
            },
            create: {
                email: s.email,
                name: s.name,
                password: hashedPassword,
                role: "STUDENT",
                standard: s.standard,
                clusterId: seedCluster.id,
                age: 7 + parseInt(s.standard), // approx age
                entranceScore: 85
            }
        })
        console.log(`Upserted student: ${user.name} (Class ${user.standard})`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
