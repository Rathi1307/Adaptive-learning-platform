
import { PrismaClient } from '@prisma/client'
import { mockStudents, mockClusters, mockCourses } from '../lib/mock-data'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Clean up
    await prisma.quizResult.deleteMany()
    await prisma.progress.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.chapter.deleteMany()
    await prisma.module.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()
    await prisma.cluster.deleteMany()

    console.log('Deleted old data.')

    // 2. Seed Clusters
    const createdClusters: Record<string, string> = {} // mockedId -> dbId

    for (const cluster of mockClusters) {
        const dbCluster = await prisma.cluster.create({
            data: {
                name: cluster.name,
                description: cluster.description,
                schedule: JSON.stringify(cluster.schedule),
                checklist: JSON.stringify(cluster.checklist),
            }
        })
        createdClusters[cluster.id] = dbCluster.id
        console.log(`Created cluster: ${cluster.name}`)
    }

    // 3. Seed Students
    // Default password for all: "password123"
    const hashedPassword = await hash('password123', 10)

    for (const student of mockStudents) {
        // Map mock clusterId to real DB id
        const dbClusterId = createdClusters[student.clusterId]

        await prisma.user.create({
            data: {
                name: student.name,
                email: student.email,
                password: hashedPassword,
                role: 'STUDENT',
                skillLevel: student.skillLevel,
                clusterId: dbClusterId,
            }
        })
    }
    console.log(`Created ${mockStudents.length} students.`)

    // 4. Seed Teacher
    await prisma.user.create({
        data: {
            name: 'Teacher Demo',
            email: 'teacher@demo.com',
            password: hashedPassword,
            role: 'TEACHER',
        }
    })
    console.log('Created teacher.')

    // 5. Seed Courses
    for (const course of mockCourses) {
        const dbCourse = await prisma.course.create({
            data: {
                title: course.title,
                description: course.description,
            }
        })

        for (const moduleItem of course.modules) {
            const dbModule = await prisma.module.create({
                data: {
                    title: moduleItem.title,
                    courseId: dbCourse.id,
                }
            })

            for (const chapter of moduleItem.chapters) {
                await prisma.chapter.create({
                    data: {
                        title: chapter.title,
                        difficulty: chapter.difficulty,
                        youtubeLink: chapter.youtubeLink,
                        subtopics: JSON.stringify(chapter.subtopics),
                        moduleId: dbModule.id,
                        content: `${chapter.title} content goes here...`
                    }
                })
            }
        }
    }
    console.log('Created courses.')

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
