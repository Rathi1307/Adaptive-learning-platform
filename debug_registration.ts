import { registerStudent } from "./app/actions.ts"

async function test() {
    console.log("Starting registration test...")
    const result = await registerStudent(
        "Test User",
        `test_${Date.now()}@example.com`,
        "password123",
        15,
        85
    )
    console.log("Registration result:", JSON.stringify(result, null, 2))
}

test().catch(console.error)
