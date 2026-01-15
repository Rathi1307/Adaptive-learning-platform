
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

// 1. Get Key from file (bypass issues with dotenv/process.env)
const envPath = path.resolve(process.cwd(), ".env");
let apiKey = "";
try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim().replace(/['"]/g, ''); // strip quotes if any
} catch (e) {
    console.error("Could not read .env");
}

if (!apiKey) {
    console.error("No API Key found.");
    process.exit(1);
}

console.log(`Using API Key: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);

const genAI = new GoogleGenerativeAI(apiKey);

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
];

async function test() {
    console.log("Starting tests...\n");
    let worked = false;

    for (const modelName of models) {
        process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log(`✅ OK! Response: "${response.text().trim()}"`);
            worked = true;
        } catch (e) {
            // simplified error message
            let msg = e.message;
            if (msg.includes("404")) msg = "404 Not Found (Model unavailable)";
            else if (msg.includes("403")) msg = "403 Forbidden (API Key invalid or location restricted)";
            else msg = msg.split('\n')[0];

            console.log(`❌ FAILED. ${msg}`);
        }
    }

    if (!worked) {
        console.log("\n❌ ALL MODELS FAILED. The API Key is likely invalid or project has no access.");
    } else {
        console.log("\n✅ At least one model works. Update lib/ai.ts with a working model.");
    }
}

test();
