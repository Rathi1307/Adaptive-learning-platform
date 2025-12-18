"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const questions = [
    {
        id: 1,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4",
    },
    {
        id: 2,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: "Paris",
    },
    {
        id: 3,
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: "Mars",
    },
];

export default function EntryQuizPage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleOptionChange = (questionId: number, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        let score = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.answer) {
                score++;
            }
        });

        let skillLevel = "BEGINNER";
        if (score === 3) skillLevel = "ADVANCED";
        else if (score === 2) skillLevel = "INTERMEDIATE";

        await fetch("/api/user/skill", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skillLevel }),
        });

        setSubmitted(true);
        setTimeout(() => {
            router.push("/dashboard/student");
        }, 2000);
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Completed!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Redirecting to your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Entry Level Assessment</h1>
            <div className="space-y-6">
                {questions.map((q) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle>{q.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup onValueChange={(val) => handleOptionChange(q.id, val)}>
                                {q.options.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                                        <Label htmlFor={`${q.id}-${option}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
                <Button onClick={handleSubmit} className="w-full" disabled={Object.keys(answers).length !== questions.length}>
                    Submit Assessment
                </Button>
            </div>
        </div>
    );
}
