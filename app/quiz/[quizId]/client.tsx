"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { submitQuizResult } from "@/app/actions";
import { Loader2, CheckCircle2, XCircle, Timer, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

interface QuizRunnerProps {
    quizId: string;
    questions: Question[];
    userEmail: string;
}

export default function QuizRunner({ quizId, questions, userEmail }: QuizRunnerProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOptionSelect = (value: string) => {
        setSelectedOption(value);
        const newAnswers = [...answers];
        newAnswers[currentIndex] = value;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(answers[currentIndex + 1] || "");
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedOption(answers[currentIndex - 1] || "");
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Calculate score
            let score = 0;
            questions.forEach((q, idx) => {
                if (answers[idx] === q.answer) score++;
            });

            await submitQuizResult(quizId, userEmail, score, questions.length);
            router.push(`/quiz/${quizId}/result?score=${score}&total=${questions.length}`);
        } catch (error) {
            console.error(error);
            alert("Failed to submit quiz.");
            setIsSubmitting(false);
        }
    };

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900">Quiz Session</h1>
                        <p className="text-slate-500 text-sm">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Timer className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress */}
                <Progress value={progress} className="h-2" />

                {/* Question Card */}
                <Card className="border-2 border-slate-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="space-y-3">
                            {currentQuestion.options.map((option, idx) => (
                                <div key={idx} className={`flex items-center space-x-2 border rounded-xl p-4 cursor-pointer transition-all ${selectedOption === option ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                                    <RadioGroupItem value={option} id={`opt-${idx}`} />
                                    <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-medium text-slate-700 text-base">{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
                        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                            Previous
                        </Button>

                        {currentIndex === questions.length - 1 ? (
                            <Button onClick={handleSubmit} disabled={isSubmitting || !selectedOption} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button onClick={handleNext} disabled={!selectedOption}>
                                Next Question
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
