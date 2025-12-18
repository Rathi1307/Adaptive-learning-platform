"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Chatbot } from "@/components/chatbot";
import { BookOpen, CheckCircle, Circle, LayoutDashboard, LogOut, Menu, Calculator, FlaskConical, Globe, Languages, Youtube } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { updateChapterProgress, generateQuizAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface StudentDashboardClientProps {
    userData: {
        name?: string | null;
        email?: string | null;
    };
    initialData: {
        student: any;
        courses: any[];
    };
}

export default function StudentDashboardClient({ userData, initialData }: StudentDashboardClientProps) {
    const router = useRouter();
    const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
    const [activeModule, setActiveModule] = useState<string>(
        initialData.courses[0]?.modules[0]?.id || ""
    );

    const handleStartQuiz = async (chapterId: string) => {
        setGeneratingQuiz(chapterId);
        try {
            const quizId = await generateQuizAction(chapterId);
            router.push(`/quiz/${quizId}`);
        } catch (error) {
            console.error("Failed to generate quiz", error);
            alert("Failed to start quiz. Please try again.");
            setGeneratingQuiz(null);
        }
    };

    // Compute active course based on active module. 
    // In this data model, modules belong to courses, but the UI sidebar lists 'modules' (Subjects) as top level nav for the student in the mock.
    // The previous mock had: Course -> Modules (Math, Science) -> Chapters.
    // My DB has: Course -> Modules -> Chapters.
    // The sidebar should probably list Modules from the enrolled Course (assuming 1 course for now, "Class 10").

    // We'll flatten modules from all courses for the sidebar if multiple courses exist, or just show the first course's modules.
    const allModules = initialData.courses.flatMap(c => c.modules);
    const activeSubject = allModules.find(m => m.id === activeModule) || allModules[0];

    // Local state for optimistic updates
    const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        allModules.forEach(mod => {
            mod.chapters.forEach((chap: any) => {
                if (chap.isCompleted) initialState[chap.id] = true;
            });
        });
        return initialState;
    });

    const handleCheck = async (chapterId: string, checked: boolean) => {
        // Optimistic update
        setCompletedChapters((prev) => ({ ...prev, [chapterId]: checked }));

        try {
            if (userData.email) {
                await updateChapterProgress(userData.email, chapterId, checked);
            }
        } catch (error) {
            console.error("Failed to update progress", error);
            // Revert on failure
            setCompletedChapters((prev) => ({ ...prev, [chapterId]: !checked }));
        }
    };

    const calculateProgress = () => {
        const totalChapters = allModules.reduce((acc, mod) => acc + mod.chapters.length, 0);
        if (totalChapters === 0) return 0;
        const completedCount = Object.values(completedChapters).filter(Boolean).length;
        return Math.round((completedCount / totalChapters) * 100);
    };

    const getSubjectIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("math")) return <Calculator className="h-5 w-5" />;
        if (t.includes("science")) return <FlaskConical className="h-5 w-5" />;
        if (t.includes("social")) return <Globe className="h-5 w-5" />;
        if (t.includes("english")) return <Languages className="h-5 w-5" />;
        return <BookOpen className="h-5 w-5" />;
    };

    const Sidebar = () => (
        <div className="h-full flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800">
            <div className="flex items-center gap-3 p-6">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                    <LayoutDashboard className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">AdaptiveLearn</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div>
                    <p className="px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Curriculum</p>
                    <nav className="space-y-1">
                        {allModules.map((module) => (
                            <Button
                                key={module.id}
                                variant="ghost"
                                className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all duration-200 group ${activeSubject?.id === module.id
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                    : "hover:bg-slate-900 hover:text-slate-100 border border-transparent"
                                    }`}
                                onClick={() => setActiveModule(module.id)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={`p-1.5 rounded-md transition-colors ${activeSubject?.id === module.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"}`}>
                                        {getSubjectIcon(module.title)}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium text-sm">{module.title}</span>
                                        <span className="text-[10px] opacity-60">{module.chapters.length} Chapters</span>
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {userData.name?.[0] || "U"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate text-white">{userData.name}</p>
                        <p className="text-xs text-slate-500 truncate">{userData.email}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors h-9"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign Out</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-72 flex-col fixed h-full shadow-2xl z-10">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-white shadow-md">
                            <Menu className="h-5 w-5 text-slate-700" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 border-r-0">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-72 p-8 overflow-y-auto bg-slate-50/50">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header & Progress */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{initialData.courses[0]?.title || "Course"}</h1>
                            <p className="text-slate-500 text-sm mt-1">Track your progress across all subjects</p>
                        </div>
                        <Card className="w-full md:w-80 border border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Completion</span>
                                    <span className="text-xl font-bold text-slate-900">{calculateProgress()}%</span>
                                </div>
                                <Progress value={calculateProgress()} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Subject Content */}
                    {activeSubject && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="h-32 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm flex items-center justify-between relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-400`} />
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{activeSubject.title}</h2>
                                    <p className="text-slate-500 mt-1">Master these chapters to ace your exams</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {getSubjectIcon(activeSubject.title)}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {activeSubject.chapters.map((chapter: any, index: number) => (
                                    <Card key={chapter.id} className="border border-slate-200 shadow-sm bg-white card-hover group overflow-hidden">
                                        <div className="flex flex-col p-1">
                                            <div className="flex items-center">
                                                <div className={`w-1 self-stretch rounded-full my-3 ml-3 ${completedChapters[chapter.id] ? "bg-green-500" : "bg-slate-200 group-hover:bg-blue-400 transition-colors"
                                                    }`} />
                                                <div className="flex-1 flex items-center justify-between p-4 pl-4">
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            id={chapter.id}
                                                            checked={completedChapters[chapter.id] || false}
                                                            onCheckedChange={(checked) => handleCheck(chapter.id, checked as boolean)}
                                                            className="h-5 w-5 border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 transition-all"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chapter {index + 1}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${chapter.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-100" :
                                                                    chapter.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                                                        "bg-red-50 text-red-700 border-red-100"
                                                                    }`}>
                                                                    {chapter.difficulty || 'Medium'}
                                                                </span>
                                                            </div>
                                                            <label
                                                                htmlFor={chapter.id}
                                                                className={`text-base font-medium cursor-pointer transition-colors ${completedChapters[chapter.id] ? "text-slate-400 line-through decoration-slate-300" : "text-slate-900 group-hover:text-blue-600"
                                                                    }`}
                                                            >
                                                                {chapter.title}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {chapter.youtubeLink && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => window.open(chapter.youtubeLink, '_blank')}
                                                            >
                                                                <Youtube className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant={completedChapters[chapter.id] ? "ghost" : "default"}
                                                            disabled={generatingQuiz === chapter.id}
                                                            onClick={completedChapters[chapter.id] ? undefined : () => handleStartQuiz(chapter.id)}
                                                            className={`rounded-lg px-5 font-medium text-xs transition-all ${completedChapters[chapter.id]
                                                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                : "bg-slate-900 text-white hover:bg-blue-600 shadow-sm"
                                                                }`}
                                                        >
                                                            {generatingQuiz === chapter.id ? (
                                                                <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Loading</>
                                                            ) : (
                                                                completedChapters[chapter.id] ? "Revise" : "Start"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subtopics Section */}
                                            {chapter.subtopics && chapter.subtopics.length > 0 && (
                                                <div className="pl-14 pr-4 pb-4 pt-0 space-y-2">
                                                    <div className="h-px bg-slate-100 mb-3" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Topics</p>
                                                    <div className="grid gap-2">
                                                        {chapter.subtopics.map((subtopic: any) => (
                                                            <div key={subtopic.id} className="flex items-center gap-3 group/sub">
                                                                <Checkbox
                                                                    id={subtopic.id}
                                                                    className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                                />
                                                                <label htmlFor={subtopic.id} className="text-sm text-slate-600 cursor-pointer group-hover/sub:text-blue-600 transition-colors">
                                                                    {subtopic.title}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Chatbot />
        </div>
    );
}
