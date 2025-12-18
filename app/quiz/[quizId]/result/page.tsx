import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, Home, BarChart3, ArrowRight } from "lucide-react";

export default async function QuizResultPage({ searchParams }: { searchParams: Promise<{ score: string, total: string }> }) {
    const { score: scoreStr, total: totalStr } = await searchParams;
    const score = parseInt(scoreStr);
    const total = parseInt(totalStr);
    const percentage = Math.round((score / total) * 100);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-xl border-t-8 border-t-blue-500">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="h-10 w-10 text-blue-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900">Quiz Completed!</CardTitle>
                    <CardDescription className="text-lg">Great job attempting this quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="py-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Score</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-extrabold text-blue-600">{percentage}%</span>
                        </div>
                        <p className="text-slate-600 mt-2 font-medium">You got {score} out of {total} correct</p>
                    </div>

                    <div className="text-sm text-slate-500">
                        {percentage >= 80 ?
                            "Excellent work! You've mastered this topic." :
                            percentage >= 50 ?
                                "Good effort! Review the material to improve your score." :
                                "Keep practicing! You'll get it next time."}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Link href="/dashboard/student" className="w-full">
                        <Button className="w-full gap-2" size="lg">
                            <Home className="h-4 w-4" />
                            Return to Dashboard
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
