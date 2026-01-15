import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Testing database write...")
    try {
        const email = `debug_${Date.now()}@example.com`
        const user = await prisma.user.create({
            data: {
                email,
                name: "Debug User",
                password: "hashed_password",
                role: "STUDENT"
            }
        })
        console.log("Write successful! User ID:", user.id)
    } catch (error) {
        console.error("Write failed:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
