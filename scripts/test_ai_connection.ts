import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

// Load env manully
const envPath = path.resolve(process.cwd(), ".env");
let apiKey = "";
try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.error("Could not read .env file");
}

if (!apiKey) {
    console.warn("API key not found in .env, checking process.env");
    apiKey = process.env.GEMINI_API_KEY || "";
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName: string) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        console.log(`✅ Success with ${modelName}:`, result.response.text());
        return true;
    } catch (error: any) {
        console.error(`❌ Failed with ${modelName}:`, error.message.split('\n')[0]); // Log first line of error
        return false;
    }
}

async function main() {
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("Starting connectivity test...");

    for (const model of modelsToTest) {
        if (await testModel(model)) {
            console.log(`\n🎉 Found working model: ${model}`);
            process.exit(0);
        }
    }

    console.error("\n❌ No working models found. Please check API key/permissions.");
    process.exit(1);
}

main();
