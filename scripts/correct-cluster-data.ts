
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting Cluster Data Correction...")
    const hashedPassword = await hash('password123', 10)

    // 1. Fix Class 10 Student (Rahul) - Move from Sapling (if there) to Tree
    const tree = await prisma.cluster.findFirst({ where: { name: 'Tree' } })
    const sapling = await prisma.cluster.findFirst({ where: { name: 'Sapling' } })
    const plant = await prisma.cluster.findFirst({ where: { name: 'Plant' } })

    if (tree) {
        // Find Rahul or any Class 10 student in Sapling
        const misplacedStudents = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                standard: '10',
                clusterId: sapling?.id // If sapling exists
            }
        })

        for (const s of misplacedStudents) {
            await prisma.user.update({
                where: { id: s.id },
                data: { clusterId: tree.id }
            })
            console.log(`Moved student ${s.name} (Class 10) to Tree.`)
        }
    }

    // 2. Populate Sapling (4-6)
    if (sapling) {
        const students = [
            { name: 'Sapling Student C4', email: 'sapling4@student.com', standard: '4' },
            { name: 'Sapling Student C5', email: 'sapling5@student.com', standard: '5' },
            { name: 'Sapling Student C6', email: 'sapling6@student.com', standard: '6' },
        ]
        for (const s of students) {
            await prisma.user.upsert({
                where: { email: s.email },
                update: { clusterId: sapling.id, standard: s.standard },
                create: {
                    email: s.email, name: s.name, standard: s.standard, clusterId: sapling.id,
                    password: hashedPassword, role: 'STUDENT', age: 10, entranceScore: 75
                }
            })
        }
        console.log("Populated Sapling with Class 4-6.")
    }

    // 3. Populate Plant (7-9)
    if (plant) {
        const students = [
            { name: 'Plant Student C7', email: 'plant7@student.com', standard: '7' },
            { name: 'Plant Student C8', email: 'plant8@student.com', standard: '8' },
            { name: 'Plant Student C9', email: 'plant9@student.com', standard: '9' },
        ]
        for (const s of students) {
            await prisma.user.upsert({
                where: { email: s.email },
                update: { clusterId: plant.id, standard: s.standard },
                create: {
                    email: s.email, name: s.name, standard: s.standard, clusterId: plant.id,
                    password: hashedPassword, role: 'STUDENT', age: 13, entranceScore: 78
                }
            })
        }
        console.log("Populated Plant with Class 7-9.")
    }

    // 4. Populate Tree (10-12)
    if (tree) {
        const students = [
            // Class 10 already exists (Rahul), just ensure he's there if needed, or add another
            { name: 'Tree Student C11', email: 'tree11@student.com', standard: '11' },
            { name: 'Tree Student C12', email: 'tree12@student.com', standard: '12' },
        ]
        for (const s of students) {
            await prisma.user.upsert({
                where: { email: s.email },
                update: { clusterId: tree.id, standard: s.standard },
                create: {
                    email: s.email, name: s.name, standard: s.standard, clusterId: tree.id,
                    password: hashedPassword, role: 'STUDENT', age: 16, entranceScore: 82
                }
            })
        }
        console.log("Populated Tree with Class 11-12.")
    }

    console.log("Data correction complete.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
