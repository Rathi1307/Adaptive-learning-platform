"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress";
import { Chatbot } from "@/components/chatbot";
import { BookOpen, LayoutDashboard, LogOut, Menu, Calculator, FlaskConical, Globe, Languages, Youtube, BrainCircuit, Clock, Activity, GraduationCap, ChevronRight, CheckSquare, FileText, MessageCircle, Send, User, FolderOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { updateChapterProgress, generateQuizAction, submitAssignment, getDashboardDataForStandard, sendMessage, getMessages } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface StudentDashboardClientProps {
    userData: {
        name?: string | null;
        email?: string | null;
        standard?: string | null;
    };
    initialData: {
        student: any;
        courses: any[];
        homework: any[];
    };
}

export default function StudentDashboardClient({ userData, initialData }: StudentDashboardClientProps) {
    const router = useRouter();
    const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
    const [view, setView] = useState<"course" | "labs" | "homework" | "messages">("course");

    // State for Dynamic Data Browsing
    const [selectedStandard, setSelectedStandard] = useState<string>(userData.standard || "10");
    const [dashboardData, setDashboardData] = useState<StudentDashboardClientProps['initialData']>(initialData);
    const [loadingStandard, setLoadingStandard] = useState(false);

    const [activeModule, setActiveModule] = useState<string>("");

    // Update active module when data changes
    useEffect(() => {
        if (dashboardData.courses.length > 0 && dashboardData.courses[0].modules.length > 0) {
            // Check if current activeModule still exists in the new data
            const allModules = dashboardData.courses.flatMap(c => c.modules);
            const exists = allModules.find(m => m.id === activeModule);

            if (!exists) {
                setActiveModule(dashboardData.courses[0].modules[0].id);
            }
        } else {
            setActiveModule("");
        }
    }, [dashboardData, activeModule]);


    const handleStandardChange = async (std: string) => {
        if (std === selectedStandard) return;
        setLoadingStandard(true);
        setSelectedStandard(std);
        try {
            const data = await getDashboardDataForStandard(std);
            setDashboardData({
                student: initialData.student,
                courses: data.courses,
                homework: initialData.homework // Keep cluster-specific homework
            });
            setActiveModule(""); // Reset to trigger useEffect for new default
        } catch (error) {
            console.error("Failed to load standard data:", error);
        } finally {
            setLoadingStandard(false);
        }
    };


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

    // Filter courses by selected standard, then get modules
    const filteredCourses = dashboardData.courses.filter(c => !c.standard || c.standard === selectedStandard);
    const allModules = filteredCourses.flatMap(c => c.modules);
    const activeSubject = allModules.find(m => m.id === activeModule) || allModules[0];

    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        if (initialData && initialData.courses) {
            initialData.courses.flatMap(c => c.modules).forEach(mod => {
                mod.chapters.forEach((chap: any) => {
                    if (chap.isCompleted) {
                        initialState[chap.id] = true;
                    }
                });
            });
        }
        return initialState;
    });

    const handleCheck = async (itemId: string, checked: boolean, isChapter: boolean = false) => {
        setCompletedItems((prev) => ({ ...prev, [itemId]: checked }));

        if (isChapter && userData.email) {
            try {
                await updateChapterProgress(userData.email, itemId, checked);
            } catch (error) {
                console.error("Failed to update progress:", error);
            }
        }
    };

    const calculateProgress = () => {
        // Find all progress-eligible items in the active subject's modules
        const progressItems = allModules.flatMap(m => m.chapters.flatMap((c: any) => {
            const subtopics = c.subtopics ? (Array.isArray(c.subtopics) ? c.subtopics : JSON.parse(c.subtopics)) : [];
            return [c.id, ...subtopics.map((_: any, i: number) => `${c.id}-${i}`)];
        }));

        if (progressItems.length === 0) return 0;
        const completedCount = progressItems.filter(id => completedItems[id]).length;
        return Math.round((completedCount / progressItems.length) * 100);
    };

    const getSubjectIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("math")) return <Calculator className="h-5 w-5" />;
        if (t.includes("science")) return <FlaskConical className="h-5 w-5" />;
        if (t.includes("social")) return <Globe className="h-5 w-5" />;
        if (t.includes("english")) return <Languages className="h-5 w-5" />;
        return <BookOpen className="h-5 w-5" />;
    };

    const VirtualLabs = () => (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Virtual Labs</h2>
                    <p className="text-slate-500 text-sm mt-1">interactive simulations for immersive learning</p>
                </div>
            </div>
            {/* ... Existing Lab Content ... */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                    { title: "DIKSHA Virtual Labs", subject: "All Classes (1-12)", description: "Official NCERT simulations and interactive content for experiential learning across all subjects.", link: "https://diksha.gov.in/virtual-labs", icon: <GraduationCap className="h-6 w-6 text-blue-600" />, color: "bg-blue-50 border-blue-100" },
                    { title: "OLabs (Online Labs)", subject: "Classes 9-12", description: "In-depth interactive labs for Physics, Chemistry, Biology, and Maths aligned with NCERT curriculum.", link: "http://www.olabs.edu.in/", icon: <FlaskConical className="h-6 w-6 text-purple-600" />, color: "bg-purple-50 border-purple-100" },
                    { title: "Acid-Base Solutions", subject: "Chemistry", description: "Explore the pH scale and how acids and bases interact.", link: "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html", icon: <FlaskConical className="h-6 w-6 text-emerald-600" />, color: "bg-emerald-50 border-emerald-100" },
                    { title: "Forces and Motion", subject: "Physics", description: "Learn about net force, acceleration, and friction.", link: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html", icon: <Activity className="h-6 w-6 text-indigo-600" />, color: "bg-indigo-50 border-indigo-100" },
                    { title: "Circuit Construction", subject: "Physics", description: "Build circuits with batteries, resistors, and switches.", link: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html", icon: <BrainCircuit className="h-6 w-6 text-amber-600" />, color: "bg-amber-50 border-amber-100" },
                ].map((lab, i) => (
                    <Card key={i} className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group">
                        <CardHeader className="pb-3">
                            <div className={`w-12 h-12 rounded-xl ${lab.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                {lab.icon}
                            </div>
                            <CardTitle className="text-lg">{lab.title}</CardTitle>
                            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">{lab.subject}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4 h-10 line-clamp-2">{lab.description}</p>
                            <Button className="w-full gap-2" variant="outline" onClick={() => window.open(lab.link, '_blank')}>
                                <FlaskConical className="h-4 w-4" />
                                Launch Lab
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const HomeworkView = () => (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Homework</h2>
                    <p className="text-slate-500 text-sm mt-1">Assignments from your teachers for the {initialData.student?.cluster?.name} cluster</p>
                </div>
            </div>
            {dashboardData.homework && dashboardData.homework.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {dashboardData.homework.map((hw: any) => (
                        <Card key={hw.id} className="border border-slate-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all group">
                            <CardHeader className="pb-3 px-6 pt-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                                        <CheckSquare className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</span>
                                        <span className="text-xs font-semibold text-slate-900">{new Date(hw.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{hw.title}</CardTitle>
                                <div className="flex gap-2 mt-2">
                                    {hw.standard && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100/50 text-blue-700 border border-blue-200/50">Class {hw.standard}</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <p className="text-sm text-slate-600 mb-6 line-clamp-3">{hw.description}</p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full gap-2 shadow-sm font-medium" variant="default">
                                            Open Assignment
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl">{hw.title}</DialogTitle>
                                            <DialogDescription>
                                                Assigned to {initialData.student?.cluster?.name} Cluster • Class {hw.standard}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner">
                                                <div className="flex items-center gap-2 mb-3 text-slate-900">
                                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                                    <h4 className="text-sm font-bold uppercase tracking-tight">Assignment Instructions</h4>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{hw.description}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-slate-700">Submission Note</Label>
                                                <textarea
                                                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                                    placeholder="Explain your approach or add comments for your teacher..."
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button variant="outline" className="flex-1">Save Draft</Button>
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10" onClick={() => alert("Submission successful for demo!")}>
                                                    Submit Now
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center bg-slate-50/50">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                        <CheckSquare className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                    <p className="text-slate-500 max-w-xs mt-1 text-sm">No pending homework assignments found for your cluster.</p>
                </Card>
            )}
        </div>
    );

    const MessagesView = () => {
        const [messages, setMessages] = useState<any[]>([]);
        const [newMessage, setNewMessage] = useState("");
        const [loadingMessages, setLoadingMessages] = useState(false);
        const [sending, setSending] = useState(false);

        // Ideally, we get the teacher ID from the cluster data.
        // If not available, we might need a fallback or it should be passed in initialData.
        const teacherId = initialData.student?.cluster?.teacherId;
        const studentId = initialData.student?.id;

        const fetchChat = async () => {
            if (!teacherId || !studentId) return;
            // Don't set loading on poll, only initial? Or handle gracefully.
            const res = await getMessages(studentId, teacherId);
            if (res.success) {
                setMessages(res.messages || []);
            }
        };

        useEffect(() => {
            setLoadingMessages(true);
            fetchChat().finally(() => setLoadingMessages(false));

            // Poll every 5 seconds
            const interval = setInterval(fetchChat, 1000);
            return () => clearInterval(interval);
        }, [teacherId, studentId]);

        const handleSend = async () => {
            if (!newMessage.trim() || !teacherId || !studentId) return;
            setSending(true);
            try {
                const res = await sendMessage(studentId, teacherId, newMessage);
                if (res.success) {
                    setNewMessage("");
                    fetchChat(); // Refresh immediately
                }
            } catch (e) {
                console.error("Send failed", e);
            } finally {
                setSending(false);
            }
        };

        if (!teacherId) {
            return (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle className="h-10 w-10 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">No Teacher Assigned</h2>
                    <p className="text-slate-500 mt-2">You cannot send messages because no teacher is assigned to your cluster.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Messages</h2>
                        <p className="text-slate-500 text-sm mt-1">Chat with your teacher</p>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col border border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-slate-900">Class Teacher</CardTitle>
                                <CardDescription className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    Online
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                        {loadingMessages && messages.length === 0 ? (
                            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                                <p>No messages yet. Say hello!</p>
                            </div>
                        ) : (
                            messages.map((msg: any) => {
                                const isMe = msg.senderId === studentId;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'
                                            }`}>
                                            {msg.attachmentUrl && (
                                                <div className="mb-2">
                                                    {msg.attachmentType === 'image' ? (
                                                        <img src={msg.attachmentUrl} alt="attachment" className="rounded-lg max-h-48 object-cover border border-white/20" />
                                                    ) : (
                                                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                                                            <FileText className="h-4 w-4" />
                                                            <span className="underline">View Attachment</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>

                    <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-end">
                        <label className="cursor-pointer p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                        const base64 = reader.result as string;
                                        setSending(true);
                                        try {
                                            const res = await sendMessage(studentId, teacherId, "Sent an image", base64, 'image');
                                            if (res.success) {
                                                fetchChat();
                                            }
                                        } finally {
                                            setSending(false);
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }} />
                            <FolderOpen className="h-5 w-5" />
                        </label>
                        <Input
                            placeholder="Type a message..."
                            className="bg-slate-50 border-slate-200 focus:ring-blue-500/20"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 shrink-0" onClick={handleSend} disabled={sending}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </Card>
            </div>
        );
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
                {/* Navigation Menu */}
                <div className="space-y-1">
                    <Button variant="ghost" className={`w-full justify-start ${view === 'course' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`} onClick={() => setView('course')}>
                        <BookOpen className="h-4 w-4 mr-3" />
                        My Syllabus
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start ${view === 'labs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`} onClick={() => setView('labs')}>
                        <FlaskConical className="h-4 w-4 mr-3" />
                        Virtual Labs
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start ${view === 'homework' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`} onClick={() => setView('homework')}>
                        <FileText className="h-4 w-4 mr-3" />
                        Assignments
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start ${view === 'messages' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`} onClick={() => setView('messages')}>
                        <MessageCircle className="h-4 w-4 mr-3" />
                        Messages
                    </Button>
                </div>
                <div className="h-px bg-slate-800 my-2" />

                {view === 'course' && (
                    <>
                        <p className="px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Your Subjects</p>
                        <nav className="space-y-1">
                            {filteredCourses.flatMap((course) =>
                                course.modules.map((module: any) => (
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
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-medium text-sm truncate w-32">{module.title}</span>
                                                <span className="text-[10px] opacity-60">{module.chapters.length} Chapters</span>
                                            </div>
                                        </div>
                                    </Button>
                                ))
                            )}
                            {filteredCourses.length === 0 && (
                                <div className="text-xs text-slate-500 px-3 text-center py-4">
                                    No subjects found for Class {selectedStandard}.
                                </div>
                            )}
                        </nav>
                    </>
                )}
            </div>
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-4 p-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">{userData.name?.[0]}</div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{userData.name}</p>
                        <p className="text-xs text-slate-500 truncate">{userData.email}</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-slate-400 hover:text-red-400 h-8" onClick={() => signOut({ callbackUrl: "/login" })}>
                    <LogOut className="h-4 w-4" /> Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* SIDEBAR FOR DESKTOP */}
            <div className="hidden md:flex w-72 flex-col fixed h-full shadow-2xl z-20">
                <Sidebar />
            </div>

            {/* MOBILE SHEET */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild><Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 border-r-0"><Sidebar /></SheetContent>
                </Sheet>
            </div>

            <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
                {/* Top Navbar with Class Dropdown */}
                <div className="bg-white border-b sticky top-0 z-10 px-6 h-16 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 md:hidden pl-12">
                        {/* Mobile Spacer */}
                        <span className="font-bold text-lg text-slate-900">AdaptiveLearn</span>
                    </div>
                    {/* Desktop spacer or breadcrumb */}
                    <div className="hidden md:flex items-center text-slate-500 text-sm">
                        <span className="font-medium text-slate-900">Dashboard</span>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span>Class {selectedStandard}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* CLASS SELECTOR IN HEADER */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Class:</span>
                            <Select value={selectedStandard} onValueChange={handleStandardChange}>
                                <SelectTrigger className="w-[110px] h-9 bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((std) => (
                                        <SelectItem key={std} value={std}>Class {std}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <p className="text-sm font-medium text-slate-700 hidden md:block">{userData.name}</p>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {loadingStandard ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                <span className="ml-3 text-slate-600">Loading Syllabus...</span>
                            </div>
                        ) : view === 'labs' ? <VirtualLabs /> : view === 'messages' ? <MessagesView /> : view === 'homework' ? (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Homework</h2>
                                        <p className="text-slate-500 text-sm mt-1">Assignments from your teachers for the {initialData.student?.cluster?.name} cluster</p>
                                    </div>
                                </div>
                                {dashboardData.homework && dashboardData.homework.length > 0 ? (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {dashboardData.homework.map((hw: any) => (
                                            <Card key={hw.id} className="border border-slate-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all group">
                                                <CardHeader className="pb-3 px-6 pt-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={`p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                                                            <CheckSquare className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</span>
                                                            <span className="text-xs font-semibold text-slate-900">{new Date(hw.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{hw.title}</CardTitle>
                                                    <div className="flex gap-2 mt-2">
                                                        {hw.standard && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100/50 text-blue-700 border border-blue-200/50">Class {hw.standard}</span>}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="px-6 pb-6">
                                                    <p className="text-sm text-slate-600 mb-6 line-clamp-3">{hw.description}</p>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className="w-full gap-2 shadow-sm font-medium" variant="default">
                                                                Open Assignment
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[500px]">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl">{hw.title}</DialogTitle>
                                                                <DialogDescription>
                                                                    Assigned to {initialData.student?.cluster?.name} Cluster • Class {hw.standard}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-6 pt-4">
                                                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner">
                                                                    <div className="flex items-center gap-2 mb-3 text-slate-900">
                                                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                                                        <h4 className="text-sm font-bold uppercase tracking-tight">Assignment Instructions</h4>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{hw.description}</p>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <Label className="text-sm font-semibold text-slate-700">Submission Note</Label>
                                                                    <textarea
                                                                        className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                                                        placeholder="Explain your approach or add comments for your teacher..."
                                                                    />
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    <Button variant="outline" className="flex-1">Save Draft</Button>
                                                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10" onClick={() => alert("Submission successful for demo!")}>
                                                                        Submit Now
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center bg-slate-50/50">
                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                            <CheckSquare className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                                        <p className="text-slate-500 max-w-xs mt-1 text-sm">No pending homework assignments found for your cluster.</p>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                            {activeSubject ? activeSubject.title : `Class ${selectedStandard} Syllabus`}
                                        </h1>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {activeSubject
                                                ? `${activeSubject.chapters.length} Chapters Available`
                                                : `Found ${allModules.length} Subjects`}
                                        </p>
                                    </div>
                                    <Card className="w-full md:w-80 border border-slate-200 shadow-sm bg-white">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning Progress</span>
                                                <span className="text-xl font-bold text-slate-900">{calculateProgress()}%</span>
                                            </div>
                                            <Progress value={calculateProgress()} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                                        </CardContent>
                                    </Card>
                                </div>


                                {activeSubject ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Subject Banner */}
                                        <div className="h-32 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm flex items-center justify-between relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-400`} />
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">{activeSubject.title}</h2>
                                                <p className="text-slate-500 mt-1">NCERT Curriculum • {activeSubject.chapters.length} Chapters</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 opacity-80">
                                                {getSubjectIcon(activeSubject.title)}
                                            </div>
                                        </div>

                                        {/* Chapters & Subtopics Accordion */}
                                        <Card className="border border-slate-200 shadow-sm bg-white">
                                            <CardContent className="p-0">
                                                <Accordion type="single" collapsible className="w-full">
                                                    {activeSubject.chapters.map((chapter: any, index: number) => {
                                                        const subtopics = chapter.subtopics ? (Array.isArray(chapter.subtopics) ? chapter.subtopics : JSON.parse(chapter.subtopics)) : [];

                                                        return (
                                                            <div key={chapter.id} className="flex items-center border-b px-6 last:border-0 hover:bg-slate-50/50 transition-colors group/row">
                                                                <Checkbox
                                                                    id={`chapter-${chapter.id}`}
                                                                    checked={completedItems[chapter.id] || false}
                                                                    onCheckedChange={(c) => handleCheck(chapter.id, c as boolean, true)}
                                                                    className="h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-slate-300"
                                                                />
                                                                <AccordionItem key={chapter.id} value={chapter.id} className="border-0 flex-1">
                                                                    <AccordionTrigger className="hover:no-underline py-5 pl-4">
                                                                        <div className="flex text-left gap-4 items-center w-full">
                                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-20 shrink-0">Chapter {index + 1}</span>
                                                                            <div className="flex flex-col">
                                                                                <span className={`font-semibold text-slate-900 text-base transition-all ${completedItems[chapter.id] ? "line-through text-slate-400" : ""}`}>{chapter.title}</span>
                                                                                <div className="flex gap-2 mt-1">
                                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${chapter.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-100" : chapter.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-100" : "bg-red-50 text-red-700 border-red-100"}`}>{chapter.difficulty || 'Medium'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </AccordionTrigger>
                                                                    <AccordionContent className="pb-6">
                                                                        <div className="pl-24 space-y-4">
                                                                            {/* Subtopics */}
                                                                            {subtopics.length > 0 ? (
                                                                                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                                                    <p className="text-xs font-bold text-slate-500 uppercase">Key Topics</p>
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                        {subtopics.map((topic: string, i: number) => (
                                                                                            <div key={i} className="flex items-start gap-2">
                                                                                                <Checkbox
                                                                                                    id={`${chapter.id}-topic-${i}`}
                                                                                                    checked={completedItems[`${chapter.id}-${i}`] || false}
                                                                                                    onCheckedChange={(c) => handleCheck(`${chapter.id}-${i}`, c as boolean)}
                                                                                                />
                                                                                                <label
                                                                                                    htmlFor={`${chapter.id}-topic-${i}`}
                                                                                                    className="text-sm text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-0.5 cursor-pointer"
                                                                                                >
                                                                                                    {topic}
                                                                                                </label>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm text-slate-400 italic mb-4">No specific subtopics listed.</p>
                                                                            )}

                                                                            {/* Actions */}
                                                                            <div className="flex gap-3 pt-2">
                                                                                <Button size="sm" onClick={() => handleStartQuiz(chapter.id)} disabled={generatingQuiz === chapter.id} className="bg-slate-900 hover:bg-slate-800">
                                                                                    {generatingQuiz === chapter.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BrainCircuit className="h-4 w-4 mr-2" />}
                                                                                    Generate Quiz
                                                                                </Button>
                                                                                <Button size="sm" variant="outline" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(chapter.title + " ncert class " + selectedStandard)}`, '_blank')}>
                                                                                    <Youtube className="h-4 w-4 mr-2 text-red-600" />
                                                                                    Watch Tutorial
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </div>
                                                        );
                                                    })}
                                                </Accordion>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-slate-500">
                                        <p>Select a subject from the sidebar to view content.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Chatbot />
        </div>
    );
}
