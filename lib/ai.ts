import Groq from "groq-sdk";

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY",
});

export async function generateQuizQuestions(topic: string, difficulty: string) {
    // Keep existing mock for now to avoid breaking the quiz flow if API key isn't set yet
    // or if we want to focus strictly on the chat task first. 
    // ... (Keeping the mock is safer for this specific step unless specifically asked to replace it)
    // Actually, let's just update the imports and exports, and leave the mock implementation 
    // but maybe comment that it could be replaced.
    // Wait, if I replace the whole file, I need to provide the content.

    // Simulating AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock response matching a JSON schema for questions
    return [
        {
            question: `What is a key concept in ${topic} related to ${difficulty} level?`,
            options: [
                "The fundamental theorem",
                "Linearly independent vectors",
                "Mitochondria power source",
                "Social contract theory"
            ],
            answer: "The fundamental theorem",
            explanation: `This is a foundational concept in ${topic} which explains the core behavior at the ${difficulty} level.`
        },
        {
            question: `Which of the following best describes the application of ${topic}?`,
            options: [
                "It is used to calculate velocity",
                "It defines the structure of the atom",
                "It helps in statistical analysis",
                "It organizes social hierarchies"
            ],
            answer: "It helps in statistical analysis",
            explanation: `Statistical analysis is a primary application field for advanced concepts in ${topic}.`
        },
        {
            question: "Solve for x: 2x + 5 = 15",
            options: ["5", "10", "2.5", "7.5"],
            answer: "5",
            explanation: "Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5."
        },
        {
            question: `True or False: ${topic} is considered a hard science.`,
            options: ["True", "False"],
            answer: "True",
            explanation: "It relies on empirical data and the scientific method."
        },
        {
            question: "Identify the outlier in the context of this subject.",
            options: ["Concept A", "Concept B", "Random Noise", "Concept C"],
            answer: "Random Noise",
            explanation: "Random Noise does not fit the pattern established by concepts A, B, and C."
        }
    ];
}
