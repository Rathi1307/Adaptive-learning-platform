import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log("--- Adding Specific Users ---")

    const teachers = ["Snape", "Dumbledore"]
    const students = ["Harry", "Ron", "Draco", "Anna", "Wednesday"]

    // 1. Get Cluster ID for 'Plant' (Class 7)
    const cluster = await prisma.cluster.findUnique({
        where: { name: 'Plant' }
    })

    if (!cluster) {
        console.error("Cluster 'Plant' not found! Please run seed first.")
        return
    }

    // 2. Add Teachers
    for (const name of teachers) {
        const email = `${name.toLowerCase()}@gmail.com`
        const hashedPassword = await hash(name, 10)

        await prisma.user.upsert({
            where: { email },
            update: { name, password: hashedPassword, role: 'TEACHER' },
            create: {
                name,
                email,
                password: hashedPassword,
                role: 'TEACHER'
            }
        })
        console.log(`Added/Updated teacher: ${name}`)
    }

    // 3. Add Students
    for (const name of students) {
        // Remove trailing period if present in name
        const cleanName = name.replace(/\.$/, '')
        const email = `${cleanName.toLowerCase()}@gmail.com`
        const hashedPassword = await hash(cleanName, 10)

        await prisma.user.upsert({
            where: { email },
            update: {
                name: cleanName,
                password: hashedPassword,
                role: 'STUDENT',
                clusterId: cluster.id,
                age: 13, // Standard Class 7 age range
                entranceScore: 75,
                skillLevel: 'INTERMEDIATE'
            },
            create: {
                name: cleanName,
                email,
                password: hashedPassword,
                role: 'STUDENT',
                clusterId: cluster.id,
                age: 13,
                entranceScore: 75,
                skillLevel: 'INTERMEDIATE'
            }
        })
        console.log(`Added/Updated student: ${cleanName} in Cluster: Plant (Class 7)`)
    }

    console.log("--- Addition Completed ---")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
