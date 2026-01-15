"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Chatbot } from "@/components/chatbot";
import { LayoutDashboard, LogOut, Users, Clock, CheckSquare, BrainCircuit, ArrowLeft, FolderOpen, BarChart3, Activity, GraduationCap, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, BookOpen, Search, Bell, Settings, Mail, FileText, PieChart, HelpCircle, User, ChevronDown, MoreHorizontal, Timer, CheckCircle2, History, X, Send, MessageCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { createHomework, performOCR, getClusterTeachingRecommendations, markSubtopicAsTaught, getLessonPlan, scheduleTopic, toggleLessonCompletion, scheduleAIRecommendation, getClusterSyllabus, toggleSubtopicTaught, getDashboardDataForStandard, sendMessage, getMessages } from "@/app/actions";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TeacherDashboardClientProps {
    userData: {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string;
    };
    initialData: {
        clusters: any[];
        students: any[];
        classPerformance: any[];
    };
}

export default function TeacherDashboardClient({ userData, initialData }: TeacherDashboardClientProps) {
    const router = useRouter();
    const [selectedCluster, setSelectedCluster] = useState<typeof initialData.clusters[0] | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<typeof initialData.students[0] | null>(null);
    const [activeView, setActiveView] = useState<"clusters" | "syllabus" | "performance" | "inboxes">("clusters");
    const [selectedStandard, setSelectedStandard] = useState<string>("10");
    const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
    const [comprehensiveCurriculum, setComprehensiveCurriculum] = useState<any[]>([]);
    const [selectedClusterForCurriculum, setSelectedClusterForCurriculum] = useState<any>(initialData.clusters[0]);
    const [loadingCurriculum, setLoadingCurriculum] = useState(false);

    // Homework Creation State
    const [isCreatingHomework, setIsCreatingHomework] = useState(false);
    const [newHomework, setNewHomework] = useState({
        title: "",
        description: "",
        dueDate: "",
        points: 10
    });

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Additional state for cluster-specific features
    const [lessonPlan, setLessonPlan] = useState<any>({ lessons: [], recommendations: [] });
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [clusterSyllabus, setClusterSyllabus] = useState<any[]>([]);
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    const fetchRecommendations = async (clusterIdOverride?: string) => {
        const idToFetch = clusterIdOverride || selectedCluster?.id;
        if (!idToFetch) return;
        setLoadingRecommendations(true);
        try {
            const recs = await getClusterTeachingRecommendations(idToFetch);
            setLessonPlan((prev: any) => ({ ...prev, recommendations: recs }));
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    // Fetch comprehensive curriculum data when standard changes
    useEffect(() => {
        const fetchCurriculumForStandard = async () => {
            setLoadingCurriculum(true);
            try {
                const data = await getDashboardDataForStandard(selectedStandard);
                setComprehensiveCurriculum(data.courses || []);

                // Auto-select first subject if available
                if (data.courses && data.courses.length > 0) {
                    const firstCourse = data.courses[0];
                    if (firstCourse.modules && firstCourse.modules.length > 0) {
                        setActiveSubjectId(firstCourse.modules[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to load curriculum:", error);
                setComprehensiveCurriculum([]);
            } finally {
                setLoadingCurriculum(false);
            }
        };

        fetchCurriculumForStandard();
    }, [selectedStandard]);
    useEffect(() => {
        if (selectedCluster) {
            fetchRecommendations();
        }
    }, [selectedCluster]);

    const handleToggleCurriculumTopic = async (standard: string, chapterId: string, subtopic: string, taught: boolean) => {
        const targetCluster = selectedClusterForCurriculum || selectedCluster;
        if (!targetCluster) {
            alert("Please select a cluster to mark progress.");
            return;
        }

        // Optimistic Update
        const updatedClusters = initialData.clusters.map(c => {
            if (c.id === targetCluster.id) {
                let newTaught = c.taughtSubtopics || [];
                if (taught) {
                    newTaught = [...newTaught, { standard, chapterId, subtopic }];
                } else {
                    newTaught = newTaught.filter((t: any) => !(t.chapterId === chapterId && t.subtopic === subtopic));
                }
                return { ...c, taughtSubtopics: newTaught };
            }
            return c;
        });

        // Use setInitialData if available, otherwise we need to mutate or use a separate state.
        // Since initialData is prop/state, let's assume we can't mutate props directly if it comes from server, 
        // but here it seems to be using `useTeacherDashboardData` pattern or passed as props? 
        // Wait, `initialData` comes from `getTeacherDashboardData`. We need a local state for clusters to update it.
        // Effectively, we need to update `selectedCluster` if it matches, and `selectedClusterForCurriculum`.

        if (selectedCluster && selectedCluster.id === targetCluster.id) {
            let newTaught = selectedCluster.taughtSubtopics || [];
            if (taught) {
                newTaught = [...newTaught, { standard, chapterId, subtopic }];
            } else {
                newTaught = newTaught.filter((t: any) => !(t.chapterId === chapterId && t.subtopic === subtopic));
            }
            setSelectedCluster({ ...selectedCluster, taughtSubtopics: newTaught });
        }

        if (selectedClusterForCurriculum && selectedClusterForCurriculum.id === targetCluster.id) {
            let newTaught = selectedClusterForCurriculum.taughtSubtopics || [];
            if (taught) {
                newTaught = [...newTaught, { standard, chapterId, subtopic }];
            } else {
                newTaught = newTaught.filter((t: any) => !(t.chapterId === chapterId && t.subtopic === subtopic));
            }
            setSelectedClusterForCurriculum({ ...selectedClusterForCurriculum, taughtSubtopics: newTaught });
        }


        try {
            const res = await toggleSubtopicTaught(targetCluster.id, standard, chapterId, subtopic, taught);
            if (res.success) {
                // Fetch latest recommendations from server to ensure accuracy
                fetchRecommendations(targetCluster.id);
                router.refresh(); // Refresh server data (initialData)
            }
        } catch (error) {
            console.error("Failed to toggle curriculum topic:", error);
            // Revert on error? For MVP, just log.
        }
    };

    const handleCreateHomework = async () => {
        if (!selectedCluster || !newHomework.title || !newHomework.dueDate) return;

        try {
            setIsCreatingHomework(true);
            const res = await createHomework(
                selectedCluster.id,
                newHomework.title,
                newHomework.description,
                newHomework.dueDate,
                newHomework.points,
                "", // No model answer for now
                "SUPERVISED", // Default mode
                selectedStandard
            );

            if (res.success) {
                // In a real app we'd refresh the cluster data or add to a local list.
                // For now, let's close the sheet and reset form.
                // We'd ideally re-fetch the selected cluster's homework
                alert("Homework assigned successfully!");
                setNewHomework({ title: "", description: "", dueDate: "", points: 10 });
            } else {
                alert("Failed to create homework");
            }
        } catch (error) {
            console.error("Failed to create homework:", error);
            alert("Error creating homework");
        } finally {
            setIsCreatingHomework(false);
        }
    };

    const handleManualSchedule = async (formData: FormData) => {
        if (!selectedCluster) return;
        const topic = formData.get("topic") as string;
        const standard = formData.get("standard") as string;
        if (!topic || !standard) return;

        try {
            const res = await scheduleTopic(selectedCluster.id, new Date().toISOString(), standard, topic);
            if (res.success) {
                // fetchPlan();
            }
        } catch (error) {
            console.error("Failed to schedule topic:", error);
        }
    };


    if (!isMounted) return null;

    // --- Sub-Components ---

    const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
        >
            <Icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
            <span className="font-bold text-sm tracking-wide">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
        </button>
    );

    const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
    );

    const MiniCalendar = () => {
        // Simplified calendar visual
        return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900">January 2026</h3>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-xs font-bold text-slate-400 py-2">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === new Date().getDate();
                        return (
                            <div key={i} className={`text-sm font-medium py-2 rounded-xl cursor-pointer transition-colors ${isToday ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-50"
                                }`}>
                                {day}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // --- VIEWS ---

    const ClustersView = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Clusters</h1>
                <p className="text-slate-500 text-base font-medium">Manage your classroom clusters and groupings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialData.clusters.map((cluster) => (
                    <div
                        key={cluster.id}
                        className="group cursor-pointer relative"
                        onClick={() => {
                            setSelectedCluster(cluster);
                        }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${cluster.color || 'from-blue-500 to-cyan-500'} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`} />
                        <Card className="border-0 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 bg-white rounded-3xl overflow-hidden h-full">
                            <div className={`h-2 w-full bg-gradient-to-r ${cluster.color || 'from-blue-500 to-cyan-500'}`} />
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50 transition-colors`}>
                                        <FolderOpen className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-600">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">{cluster.name}</CardTitle>
                                <CardDescription className="line-clamp-2 text-sm pt-1">{cluster.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-600">{cluster.students.length} Students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-600">{cluster.schedule?.duration || '60 mins'}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-wider">Next Class</span>
                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Today, 10:00 AM</span>
                                    </div>
                                    <p className="font-bold text-slate-900 mt-1 truncate">{cluster.schedule?.topic || 'General Session'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {/* Add New Cluster Card */}
                <button className="h-full min-h-[250px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 group">
                    <div className="h-16 w-16 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                        <Plus className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Create New Cluster</span>
                </button>
            </div>
        </div>
    );

    const SyllabusTrackerView = () => {
        const standards = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

        // Get all modules from comprehensive curriculum
        const allModules = comprehensiveCurriculum.flatMap(c => c.modules || []);
        const activeSubject = allModules.find(m => m.id === activeSubjectId);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col lg:row justify-between items-start lg:items-end gap-6">
                    <div className="max-w-xl">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Curriculum</h1>
                        <p className="text-slate-500 text-base font-medium leading-relaxed">Centralized NCERT mapping and progress tracking.</p>
                    </div>
                    <div className="flex gap-4">
                        <Select value={selectedClusterForCurriculum?.id || ""} onValueChange={(val) => setSelectedClusterForCurriculum(initialData.clusters.find(c => c.id === val))}>
                            <SelectTrigger className="w-48 h-12 border-none bg-white hover:bg-slate-50 rounded-2xl shadow-sm font-bold text-xs transition-all px-5 text-slate-900">
                                <Users className="h-4 w-4 mr-2 text-blue-600" />
                                <SelectValue placeholder="Select Cluster" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                {initialData.clusters.map(cluster => (
                                    <SelectItem key={cluster.id} value={cluster.id} className="font-bold py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] text-slate-600">{cluster.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                            <SelectTrigger className="w-40 h-12 border-none bg-white hover:bg-slate-50 rounded-2xl shadow-sm font-bold text-xs transition-all px-5 text-slate-900">
                                <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                {standards.map(std => <SelectItem key={std} value={std} className="font-bold py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] text-slate-600">Class {std}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={activeSubjectId || ""} onValueChange={setActiveSubjectId}>
                            <SelectTrigger className="w-48 h-12 border-none bg-white hover:bg-slate-50 rounded-2xl shadow-sm font-bold text-xs transition-all px-5 text-slate-900">
                                <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                                <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                {allModules.map(module => (
                                    <SelectItem key={module.id} value={module.id} className="font-bold py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] text-slate-600">{module.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-6">
                    {loadingCurriculum ? (
                        <div className="py-60 flex flex-col items-center justify-center gap-10">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="font-bold text-[10px] text-slate-300 uppercase tracking-[0.4em]">Loading Curriculum</p>
                        </div>
                    ) : !activeSubject ? (
                        <div className="py-32 text-center bg-slate-50/50 rounded-[48px] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-bold text-2xl uppercase tracking-wider">Select a subject</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Subject Banner */}
                            <div className="h-48 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-600 p-10 shadow-lg shadow-blue-900/10 flex items-center justify-between relative overflow-hidden">
                                <div className="relative z-10 text-white">
                                    <h2 className="text-3xl font-bold tracking-tight mb-2">{activeSubject.title}</h2>
                                    <p className="text-blue-100 font-medium">Class {selectedStandard} • NCERT Curriculum</p>
                                    <div className="flex gap-3 mt-6">
                                        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20">
                                            {activeSubject.chapters?.length || 0} Chapters
                                        </div>
                                    </div>
                                </div>
                                <BookOpen className="absolute right-[-20px] bottom-[-40px] h-64 w-64 text-white opacity-10 rotate-12" />
                            </div>

                            {/* Chapters Accordion */}
                            <Card className="border-0 shadow-sm bg-white rounded-[32px] overflow-hidden">
                                <CardContent className="p-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        {(activeSubject.chapters || []).map((chapter: any, index: number) => {
                                            const subtopics = chapter.subtopics ? (Array.isArray(chapter.subtopics) ? chapter.subtopics : JSON.parse(chapter.subtopics)) : [];
                                            const chapterKey = `${activeSubject.id}-${chapter.id}`;

                                            return (
                                                <div key={chapter.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                    <AccordionItem value={chapter.id} className="border-0">
                                                        <AccordionTrigger className="hover:no-underline py-6 px-8">
                                                            <div className="flex text-left gap-6 items-center w-full">
                                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-lg shadow-inner">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-bold text-slate-900 text-lg">{chapter.title}</span>
                                                                    <div className="flex gap-2">
                                                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${chapter.difficulty === "Easy" ? "bg-green-50 text-green-600 border-green-100" : chapter.difficulty === "Medium" ? "bg-yellow-50 text-yellow-600 border-yellow-100" : "bg-red-50 text-red-600 border-red-100"}`}>{chapter.difficulty || 'Medium'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pb-8 px-8 pl-[88px]">
                                                            <div className="space-y-6">
                                                                {subtopics.length > 0 ? (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {subtopics.map((topic: string, i: number) => {
                                                                            // Check if this topic is taught for the SELECTED cluster
                                                                            const targetCluster = selectedClusterForCurriculum || selectedCluster;
                                                                            // "taughtSubtopics" is an array of objects { chapterId, subtopic, ... }
                                                                            // We need to check if it exists in the targetCluster's list
                                                                            // Note: initialData.clusters needs to include taughtSubtopics now.
                                                                            // We might need to refresh initialData or manage local state for 'taught'
                                                                            const isTaught = targetCluster?.taughtSubtopics?.some((t: any) => t.chapterId === chapter.id && t.subtopic === topic);

                                                                            return (
                                                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item">
                                                                                    <Checkbox
                                                                                        id={`${chapterKey}-topic-${i}`}
                                                                                        checked={isTaught}
                                                                                        onCheckedChange={(c) => handleToggleCurriculumTopic(selectedStandard, chapter.id, topic, !!c)}
                                                                                        className="data-[state=checked]:bg-blue-600 border-slate-300 h-5 w-5 rounded-md"
                                                                                    />
                                                                                    <label
                                                                                        htmlFor={`${chapterKey}-topic-${i}`}
                                                                                        className={`text-sm font-medium cursor-pointer flex-1 group-hover/item:text-slate-900 ${isTaught ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600"}`}
                                                                                    >
                                                                                        {topic}
                                                                                    </label>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-slate-400 italic">No specific subtopics listed.</p>
                                                                )}

                                                                <div className="flex gap-3 pt-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleManualSchedule(new FormData(Object.assign(document.createElement('form'), { topic: chapter.title, standard: selectedStandard })))}
                                                                        className="bg-slate-900 hover:bg-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl h-10 px-5 shadow-lg shadow-slate-900/10"
                                                                    >
                                                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                                                        Schedule Lesson
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
                    )}
                </div>
            </div>
        );
    };

    const PerformanceView = () => {
        const displayStudents = selectedCluster ? selectedCluster.students : initialData.students;

        // --- Heatmap Logic ---
        // 1. Generate last 14 dates
        const dates = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().split('T')[0];
        });

        // 2. Aggregate scores per cluster per date
        // Structure: { [clusterId]: { [date]: { totalScore: number, count: number } } }
        const heatmapData: Record<string, Record<string, { total: number, count: number }>> = {};

        initialData.clusters.forEach(cluster => {
            heatmapData[cluster.id] = {};
            cluster.students.forEach((student: any) => {
                student.quizResults?.forEach((result: any) => {
                    const date = new Date(result.createdAt).toISOString().split('T')[0];
                    if (!heatmapData[cluster.id][date]) {
                        heatmapData[cluster.id][date] = { total: 0, count: 0 };
                    }
                    heatmapData[cluster.id][date].total += result.score;
                    heatmapData[cluster.id][date].count += 1;
                });
            });
        });

        const getColor = (avg: number | null) => {
            if (avg === null) return "bg-slate-50 border-slate-100";
            if (avg >= 80) return "bg-emerald-500 border-emerald-600 shadow-emerald-200";
            if (avg >= 60) return "bg-emerald-400 border-emerald-500 shadow-emerald-200";
            if (avg >= 40) return "bg-emerald-300 border-emerald-400 shadow-emerald-100";
            return "bg-emerald-200 border-emerald-300";
        };

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Performance</h1>
                    <p className="text-slate-500 text-base font-medium">Detailed student reports and analytics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Average Score" value="78%" trend={12} icon={BarChart3} color="bg-blue-500" />
                    <StatCard title="Active Students" value={displayStudents.length} trend={5} icon={Users} color="bg-green-500" />
                    <StatCard title="Quiz Completion" value="92%" trend={-2} icon={CheckSquare} color="bg-purple-500" />
                </div>

                {/* Heatmap Section */}
                <Card className="border-0 shadow-sm bg-white rounded-[32px] overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Cluster Performance Heatmap</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Average Daily Quiz Scores (Last 14 Days)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Intensity</span>
                            <div className="h-3 w-3 rounded-full bg-emerald-200" />
                            <div className="h-3 w-3 rounded-full bg-emerald-300" />
                            <div className="h-3 w-3 rounded-full bg-emerald-400" />
                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-4">
                        <div className="min-w-[800px]">
                            {/* Header Row (Dates) */}
                            <div className="flex mb-4">
                                <div className="w-32 shrink-0"></div> {/* Spacer for Cluster Names */}
                                {dates.map(date => (
                                    <div key={date} className="flex-1 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Data Rows */}
                            <div className="space-y-3">
                                {initialData.clusters.map(cluster => (
                                    <div key={cluster.id} className="flex items-center">
                                        <div className="w-32 shrink-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${cluster.color || 'from-blue-500 to-cyan-500'}`} />
                                                <span className="font-bold text-sm text-slate-700 truncate">{cluster.name}</span>
                                            </div>
                                        </div>
                                        {dates.map(date => {
                                            const dayData = heatmapData[cluster.id]?.[date];
                                            const avg = dayData ? Math.round(dayData.total / dayData.count) : null;

                                            // Tooltip logic needs to be simple for now. 
                                            // Using 'title' attribute for basic native tooltip.
                                            return (
                                                <div key={date} className="flex-1 px-1">
                                                    <div
                                                        title={`${cluster.name} on ${date}: ${avg !== null ? avg + '%' : 'No Data'}`}
                                                        className={`h-10 rounded-xl w-full border transition-all hover:scale-105 hover:shadow-lg duration-200 cursor-pointer ${getColor(avg)}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-[32px] overflow-hidden">
                    <CardHeader className="border-b border-slate-50 py-6 px-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-slate-900">Student List {selectedCluster && `(${selectedCluster.name})`}</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs">Export CSV</Button>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs">Filter</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="pl-8 h-12 text-xs font-bold uppercase tracking-wider text-slate-400">Name</TableHead>
                                    <TableHead className="h-12 text-xs font-bold uppercase tracking-wider text-slate-400">Progress</TableHead>
                                    <TableHead className="h-12 text-xs font-bold uppercase tracking-wider text-slate-400">Skill Level</TableHead>
                                    <TableHead className="pr-8 text-right h-12 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStudents.map((student: any) => (
                                    <TableRow key={student.id} className="hover:bg-slate-50/50 border-slate-50 cursor-pointer">
                                        <TableCell className="pl-8 py-4 font-bold text-slate-700">{student.name}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Progress value={45} className="h-2 w-24 bg-slate-100" indicatorClassName="bg-blue-500" />
                                                <span className="text-xs font-bold text-slate-500">45%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${student.skillLevel === "BEGINNER" ? "bg-red-50 text-red-600 border-red-100" :
                                                student.skillLevel === "INTERMEDIATE" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                                    "bg-green-50 text-green-600 border-green-100"
                                                }`}>
                                                {student.skillLevel}
                                            </span>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right py-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" onClick={() => setSelectedStudent(student)}>
                                                <Activity className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }




    const ClusterDetailView = () => (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
            <div className={`h-40 bg-gradient-to-r ${selectedCluster?.color || 'from-indigo-600 to-blue-600'} p-10 flex items-center justify-between relative overflow-hidden rounded-[32px] mb-8 shadow-lg shadow-blue-900/5`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-white/10 rounded-full blur-3xl opacity-20" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-blue-400/20 rounded-full blur-3xl opacity-20" />

                <div className="flex items-center gap-8 relative z-10">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/20 rounded-xl" onClick={() => setSelectedCluster(null)}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/30 text-white shadow-2xl">
                        <FolderOpen className="h-10 w-10" />
                    </div>
                    <div className="text-white text-left">
                        <h1 className="text-4xl font-extrabold tracking-tight">{selectedCluster?.name}</h1>
                        <p className="text-blue-100/80 text-lg font-medium mt-1 leading-relaxed max-w-lg text-left">{selectedCluster?.description}</p>
                    </div>
                </div>
            </div>

            <div className="p-2">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-white p-1.5 rounded-[20px] border border-slate-100 mb-10 inline-flex h-auto shadow-sm">
                        <TabsTrigger value="overview" className="rounded-[16px] px-8 py-3.5 font-bold text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Overview</TabsTrigger>
                        <TabsTrigger value="students" className="rounded-[16px] px-8 py-3.5 font-bold text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Students</TabsTrigger>
                        <TabsTrigger value="homework" className="rounded-[16px] px-8 py-3.5 font-bold text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Homework</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* What to Teach Next Section - Expanded Full Width */}
                        <div className="mb-16">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-1">
                                <div className="flex items-center gap-5">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1">What to Teach Next</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-8 bg-blue-600/30 rounded-full"></div>
                                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Recommended Sessions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {(() => {
                                if (loadingRecommendations) {
                                    return (
                                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-24 flex flex-col items-center justify-center space-y-6">
                                            <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Analysing performance data...</p>
                                        </div>
                                    );
                                }
                                if (lessonPlan.recommendations && lessonPlan.recommendations.length > 0) {
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {lessonPlan.recommendations.map((rec: any, idx: number) => {
                                                const nextRec = rec.recommendation;
                                                if (!nextRec) return null;
                                                return (
                                                    <div key={idx} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:border-blue-200 transition-all hover:shadow-lg flex flex-col gap-6 group relative overflow-hidden h-full">
                                                        {/* Left: Standard Only */}
                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase border border-slate-100">
                                                                Class {rec.standard}
                                                            </span>
                                                        </div>

                                                        {/* Middle: Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-left truncate">{nextRec.subtopic}</h4>
                                                            <p className="text-slate-500 text-sm font-medium text-left opacity-80 mt-1 max-w-2xl truncate">{nextRec.chapterTitle || nextRec.chapterId}</p>
                                                        </div>

                                                        {/* Right: Action */}
                                                        <div className="shrink-0 w-full mt-auto">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button className="w-full h-12 px-8 bg-slate-900 text-white hover:bg-blue-600 font-bold rounded-xl shadow-lg border-0 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] text-xs uppercase tracking-widest">
                                                                        <Plus className="h-4 w-4" />
                                                                        Schedule
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="rounded-[40px] p-0 overflow-hidden bg-white max-w-md border-0 shadow-2xl">
                                                                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                                                                        <div className="absolute -right-10 -top-10 h-40 w-40 bg-blue-600 opacity-20 blur-3xl rounded-full" />
                                                                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-left relative z-10">Quick Schedule</DialogTitle>
                                                                        <DialogDescription className="text-slate-400 mt-2 text-left font-medium relative z-10">Ready for Class {rec.standard}</DialogDescription>
                                                                    </div>
                                                                    <div className="p-10">
                                                                        <form action={handleManualSchedule} className="space-y-6">
                                                                            <div className="space-y-2 text-left">
                                                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Recommendation Meta</Label>
                                                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                                                                                    <p className="text-slate-900 font-bold text-sm">{nextRec.subtopic}</p>
                                                                                    <p className="text-slate-400 text-xs mt-1">{nextRec.chapterTitle || nextRec.chapterId}</p>
                                                                                </div>
                                                                                <input type="hidden" name="topic" value={nextRec.subtopic} />
                                                                                <input type="hidden" name="standard" value={rec.standard} />
                                                                            </div>
                                                                            <Button type="submit" className="w-full h-16 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all text-sm">Confirm Lesson</Button>
                                                                        </form>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-white rounded-[40px] p-20 border border-slate-100 text-center shadow-sm">
                                        <div className="h-24 w-24 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Cluster Goals Achieved</h4>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto">All recommended topics for this cluster have been successfully covered.</p>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column: Stats */}
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
                                    <div className="h-16 w-16 rounded-[20px] bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                        <Users className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="uppercase tracking-widest text-[10px] font-bold text-slate-400 mb-0.5 text-left">Total Students</h3>
                                        <p className="text-4xl font-black text-slate-900 leading-none text-left">{selectedCluster?.students?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-green-200 transition-all">
                                    <div className="h-16 w-16 rounded-[20px] bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shadow-inner">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="uppercase tracking-widest text-[10px] font-bold text-slate-400 mb-0.5 text-left">Cluster Health</h3>
                                        <p className="text-4xl font-black text-green-600 leading-none text-left">Good</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Mini Schedule */}
                            <div className="md:col-span-2">
                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col h-full ring-1 ring-slate-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Timer className="h-5 w-5 text-slate-600" />
                                            </div>
                                            Session Breakdown
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today&apos;s Plan</span>
                                    </div>

                                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                        {(() => {
                                            try {
                                                const schedule = selectedCluster?.schedule ? JSON.parse(selectedCluster.schedule) : null;
                                                const segments = schedule?.segments || [];

                                                if (segments.length === 0) {
                                                    return <div className="flex flex-col items-center justify-center w-full py-8 text-slate-400 italic">No schedule defined.</div>;
                                                }

                                                return segments.map((seg: any, idx: number) => (
                                                    <div key={idx} className="flex-shrink-0 w-52 bg-slate-50 border border-slate-100 rounded-[24px] p-6 group hover:bg-slate-900 hover:text-white transition-all hover:shadow-xl hover:shadow-slate-900/10 flex flex-col items-start">
                                                        <div className="flex items-center justify-between mb-5 w-full">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 leading-none">Segment {idx + 1}</span>
                                                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                        </div>
                                                        <h4 className="font-bold text-lg mb-1 uppercase tracking-tight leading-none text-left">Class {seg.standard}</h4>
                                                        <p className="text-[11px] font-medium opacity-60 uppercase text-left">{seg.duration || "30m"}</p>
                                                    </div>
                                                ));
                                            } catch (e) { return null; }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="students" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-0 shadow-sm bg-white rounded-[32px] overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="pl-8 h-14 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Student Profile</TableHead>
                                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current Progress</TableHead>
                                        <TableHead className="pr-8 h-14 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Last Session</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedCluster?.students?.map((s: any, idx: number) => {
                                        const initials = s.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                                        const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];
                                        const avatarColor = colors[idx % colors.length];

                                        return (
                                            <TableRow key={s.id} className="hover:bg-slate-50/80 border-slate-50 transition-colors group">
                                                <TableCell className="pl-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl flex-shrink-0 border-2 border-white shadow-sm overflow-hidden overflow-hidden">
                                                            <div className={`h-full w-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                                                                {initials}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-none mb-1 text-left">{s.name}</p>
                                                            <p className="text-[11px] font-medium text-slate-400 tracking-tight text-left">{s.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full w-fit border border-emerald-100 uppercase text-[10px] font-bold tracking-wider">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        On Track
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-full max-w-[120px]">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">82%</span>
                                                        </div>
                                                        <Progress value={82} className="h-1.5 bg-slate-100" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right">
                                                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider tabular-nums">Today, 10:45 AM</p>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {(!selectedCluster?.students || selectedCluster.students.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium">No students assigned to this cluster.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="homework" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col gap-8">
                            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Active Assignments</h3>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Manage homework and quizzes for {selectedCluster?.name}</p>
                                </div>
                                <Sheet open={isCreatingHomework} onOpenChange={setIsCreatingHomework}>
                                    <SheetTrigger asChild>
                                        <Button className="bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Homework
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-0">
                                        <div className="p-8 pb-32">
                                            <SheetHeader className="mb-8">
                                                <SheetTitle className="text-2xl font-bold text-slate-900">New Assignment</SheetTitle>
                                                <SheetDescription className="text-slate-500 font-medium">Create a new task for {selectedCluster?.name}</SheetDescription>
                                            </SheetHeader>

                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Title</Label>
                                                    <Input
                                                        placeholder="e.g. Chapter 3: Laws of Motion - Exercises"
                                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500/20"
                                                        value={newHomework.title}
                                                        onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Description</Label>
                                                    <Textarea
                                                        placeholder="Provide detailed instructions..."
                                                        className="min-h-[150px] rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500/20 resize-none p-4"
                                                        value={newHomework.description}
                                                        onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Due Date</Label>
                                                        <Input
                                                            type="date"
                                                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500/20"
                                                            value={newHomework.dueDate}
                                                            onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Points</Label>
                                                        <Input
                                                            type="number"
                                                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500/20"
                                                            value={newHomework.points}
                                                            onChange={(e) => setNewHomework({ ...newHomework, points: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-10 flex gap-4">
                                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200" onClick={() => setIsCreatingHomework(false)}>Cancel</Button>
                                                <Button className="flex-1 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" onClick={handleCreateHomework}>
                                                    {isCreatingHomework ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Homework"}
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <div className="grid gap-4">
                                {selectedCluster?.homework && selectedCluster.homework.length > 0 ? (
                                    selectedCluster.homework.map((hw: any) => (
                                        <Card key={hw.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
                                            <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                                <div className="flex gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                        <FileText className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{hw.title}</h4>
                                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                                                            <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> Due {new Date(hw.dueDate).toLocaleDateString()}</span>
                                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                            <span>{hw.points} pts</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        {hw.submissions?.slice(0, 3).map((sub: any, i: number) => (
                                                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600" title={sub.student?.name}>
                                                                {sub.student?.name?.[0]}
                                                            </div>
                                                        ))}
                                                        {hw.submissions?.length > 3 && (
                                                            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                                +{hw.submissions.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button variant="outline" className="rounded-xl font-bold text-xs h-10 border-slate-200" disabled>View Submissions</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <CheckSquare className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No active assignments</h3>
                                        <p className="text-slate-500 font-medium">Create a homework assignment to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );


    return (
        <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar */}
            <aside className="w-80 bg-[#0F172A] p-6 flex flex-col shadow-2xl z-20">
                <div className="flex items-center gap-3 px-2 mb-12">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                        <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight leading-none">InsightHub</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Teacher Dashboard</p>
                    </div>
                </div>

                <div className="space-y-2 flex-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Clusters"
                        active={activeView === "clusters" && !selectedCluster}
                        onClick={() => {
                            if (selectedCluster) setSelectedCluster(null);
                            setActiveView("clusters");
                        }}
                    />
                    <SidebarItem
                        icon={BookOpen}
                        label="Curriculum"
                        active={activeView === "syllabus"}
                        onClick={() => {
                            setSelectedCluster(null);
                            setActiveView("syllabus");
                        }}
                    />
                    <SidebarItem
                        icon={BarChart3}
                        label="Performance"
                        active={activeView === "performance"}
                        onClick={() => {
                            setSelectedCluster(null);
                            setActiveView("performance");
                        }}
                    />
                    <SidebarItem
                        icon={Mail}
                        label="Inbox"
                        active={activeView === "inboxes"}
                        onClick={() => {
                            setSelectedCluster(null);
                            setActiveView("inboxes");
                        }}
                    />
                </div>

                <div className="pt-6 border-t border-slate-800">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group">
                        <Settings className="h-5 w-5" />
                        <span className="font-bold text-sm">Settings</span>
                    </button>
                    <div className="mt-6 flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <Avatar className="h-10 w-10 border-2 border-slate-700">
                            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userData.name}`} />
                            <AvatarFallback>TC</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{userData.name}</p>
                            <p className="text-[10px] text-slate-400 truncate font-medium">{userData.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg h-8 w-8" onClick={() => signOut()}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header - Only show if NO cluster is selected (default view) */}
                {!selectedCluster && (
                    <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-xl border-b border-white/20 px-10 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span>Dashboard</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-slate-900 font-bold capitalize">{activeView}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:bg-slate-50">
                                <Search className="h-5 w-5" />
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:bg-slate-50 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white" />
                            </div>
                        </div>
                    </header>
                )}

                <div className="p-10 max-w-[1600px] mx-auto pb-20">
                    {selectedCluster ? (
                        <ClusterDetailView />
                    ) : (
                        <>
                            {activeView === "clusters" && <ClustersView />}
                            {activeView === "syllabus" && <SyllabusTrackerView />}
                            {activeView === "performance" && <PerformanceView />}
                            {activeView === "inboxes" && <InboxesView userData={userData} initialData={initialData} />}
                        </>
                    )}
                </div>
            </main>

            {/* Student Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-3xl rounded-3xl border-0 p-0 overflow-hidden" aria-describedby="student-details-description">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex items-center gap-6">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                            <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
                                {selectedStudent?.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-white">
                            <DialogTitle className="text-2xl font-bold">{selectedStudent?.name}</DialogTitle>
                            <DialogDescription id="student-details-description" className="opacity-80 font-medium text-blue-100">{selectedStudent?.email}</DialogDescription>
                        </div>
                    </div>

                    <Tabs defaultValue="online" className="w-full">
                        <div className="px-8 pt-6">
                            <TabsList className="bg-slate-50 p-1 rounded-xl border border-slate-100 w-full grid grid-cols-2">
                                <TabsTrigger value="online" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Online Performance</TabsTrigger>
                                <TabsTrigger value="offline" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Offline Tests</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="online" className="p-8 space-y-8 focus-visible:outline-none">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skill Level</p>
                                    <p className="font-bold text-slate-900 text-lg">{selectedStudent?.skillLevel}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cluster</p>
                                    <p className="font-bold text-slate-900 text-lg">{selectedCluster?.name || 'Assigned Cluster'}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-6 text-lg font-bold text-slate-900">Performance Trend (Quizzes)</h4>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={selectedStudent?.quizResults?.map((r: any) => ({
                                            quiz: r.quiz?.chapter?.title || 'Quiz',
                                            score: r.score
                                        })).reverse() || []}>
                                            <XAxis dataKey="quiz" hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                                            />
                                            <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6, fill: '#2563eb' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="offline" className="p-8 space-y-8 focus-visible:outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Add Mark Form */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Add Offline Mark</h4>
                                        <p className="text-sm text-slate-500">Record scores from manual tests.</p>
                                    </div>
                                    <form action={async (formData) => {
                                        if (!selectedStudent) return;
                                        const subject = formData.get('subject') as string;
                                        const score = parseFloat(formData.get('score') as string);
                                        const total = parseFloat(formData.get('total') as string);

                                        if (subject && !isNaN(score) && !isNaN(total)) {
                                            const { addOfflineMark } = await import('@/app/manual_marks_actions');
                                            const res = await addOfflineMark(selectedStudent.id, subject, score, total);
                                            if (res.success) {
                                                alert("Mark added!");
                                                // Ideally refresh data
                                                router.refresh();
                                            }
                                        }
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="text-xs font-bold uppercase text-slate-400">Subject</Label>
                                            <Select name="subject">
                                                <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-slate-200"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                                    <SelectItem value="Science">Science</SelectItem>
                                                    <SelectItem value="Social Science">Social Science</SelectItem>
                                                    <SelectItem value="English">English</SelectItem>
                                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="score" className="text-xs font-bold uppercase text-slate-400">Score</Label>
                                                <Input id="score" name="score" type="number" step="0.5" className="h-12 rounded-xl bg-slate-50 border-slate-200" placeholder="0" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="total" className="text-xs font-bold uppercase text-slate-400">Total</Label>
                                                <Input id="total" name="total" type="number" className="h-12 rounded-xl bg-slate-50 border-slate-200" defaultValue="100" required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">Add Record</Button>
                                    </form>
                                </div>

                                {/* Chart Section */}
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-6">Subject Performance</h4>
                                    <div className="h-[250px] w-full">
                                        {/* 
                                           Note: For real implementation, need to fetch offlineMarks from server or pass in initialData.
                                           Since we just added the model, initialData.students needs to include offlineMarks.
                                           Assuming we updated getTeacherDashboardData to include offlineMarks.
                                        */}
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={(() => {
                                                // Aggregate marks by subject
                                                const marks = (selectedStudent as any)?.offlineMarks || [];
                                                const subMap: Record<string, { total: number, max: number }> = {};

                                                marks.forEach((m: any) => {
                                                    if (!subMap[m.subject]) subMap[m.subject] = { total: 0, max: 0 };
                                                    subMap[m.subject].total += m.score;
                                                    subMap[m.subject].max += m.totalMarks;
                                                });

                                                return Object.entries(subMap).map(([sub, data]) => ({
                                                    subject: sub,
                                                    percentage: Math.round((data.total / data.max) * 100)
                                                }));
                                            })()}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                <Tooltip
                                                    cursor={{ fill: '#f1f5f9', radius: 8 }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="percentage" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                                                    {
                                                        // Optional: Different colors for subjects
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        {(!selectedStudent || !(selectedStudent as any).offlineMarks?.length) && (
                                            <div className="flex flex-col items-center justify-center -mt-40 text-center pointer-events-none opacity-50">
                                                <FileText className="h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Data Available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent List */}
                            <div className="pt-6 border-t border-slate-100">
                                <h5 className="text-sm font-bold text-slate-900 mb-4">Recent Entries</h5>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {((selectedStudent as any)?.offlineMarks || []).length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">No offline marks recorded yet.</p>
                                    ) : (
                                        ((selectedStudent as any)?.offlineMarks || []).slice().reverse().map((mark: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div>
                                                    <p className="font-bold text-xs text-slate-700 uppercase tracking-wider">{mark.subject}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{new Date(mark.testDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{mark.score}/{mark.totalMarks}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${(mark.score / mark.totalMarks) >= 0.7 ? 'bg-green-100 text-green-700' :
                                                            (mark.score / mark.totalMarks) >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {Math.round((mark.score / mark.totalMarks) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface InboxesViewProps {
    userData: {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string;
    };
    initialData: {
        clusters: any[];
        students: any[];
        classPerformance: any[];
    };
}

function InboxesView({ userData, initialData }: InboxesViewProps) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeStudent, setActiveStudent] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Derive teacher ID from first valid cluster (assuming teacher owns data)
    // Use the logged-in user's ID as the teacher ID. 
    // This is more robust than relying on the cluster's teacherId, which might be missing or mismatched.
    const currentTeacherId = userData?.id || initialData.clusters?.[0]?.teacherId;

    useEffect(() => {
        const allStudents = initialData.clusters.flatMap(c => c.students || []);
        // Deduplicate students based on ID
        const seen = new Set();
        const unique = allStudents.filter(s => {
            const duplicate = seen.has(s.id);
            seen.add(s.id);
            return !duplicate;
        });
        setConversations(unique);
    }, []);

    const fetchChat = async () => {
        if (!activeStudent || !currentTeacherId) return;
        const res = await getMessages(currentTeacherId, activeStudent.id);
        if (res.success) {
            setMessages(res.messages || []);
        }
    };

    useEffect(() => {
        if (activeStudent) {
            setLoadingMessages(true);
            fetchChat().finally(() => setLoadingMessages(false));

            const interval = setInterval(fetchChat, 5000);
            return () => clearInterval(interval);
        }
    }, [activeStudent]);

    const handleSend = async () => {
        if (!newMessage.trim() || !activeStudent || !currentTeacherId) return;
        setSending(true);
        try {
            const res = await sendMessage(currentTeacherId, activeStudent.id, newMessage);
            if (res.success) {
                setNewMessage("");
                fetchChat();
            } else {
                console.error("Failed to send message:", res.error);
            }
        } catch (e) {
            console.error("Error sending message", e);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 h-[calc(100vh-140px)] flex flex-col">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Inbox</h1>
                <p className="text-slate-500 text-base font-medium">Doubts, messages, and notifications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                {/* Conversation List */}
                <Card className="col-span-1 border-0 shadow-sm bg-white rounded-[32px] overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Search students..." />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 italic">No students found.</div>
                        ) : (
                            conversations.map((student) => (
                                <div
                                    key={student.id}
                                    className={`p-4 rounded-2xl cursor-pointer transition-colors group flex justify-between items-center ${activeStudent?.id === student.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                    onClick={() => setActiveStudent(student)}
                                >
                                    <div>
                                        <h4 className={`font-bold ${activeStudent?.id === student.id ? 'text-blue-700' : 'text-slate-900'}`}>{student.name}</h4>
                                        <p className="text-xs text-slate-400 line-clamp-1">{student.email}</p>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 ${activeStudent?.id === student.id ? 'text-blue-500' : 'text-slate-300'}`} />
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat Area */}
                <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm bg-white rounded-[32px] flex flex-col overflow-hidden h-full">
                    {activeStudent ? (
                        <>
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {activeStudent.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{activeStudent.name}</h3>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class {activeStudent.standard || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                                {loadingMessages && messages.length === 0 ? (
                                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                                        <p>Start a conversation with {activeStudent.name}</p>
                                    </div>
                                ) : (
                                    messages.map((msg: any) => {
                                        const isMe = msg.senderId === currentTeacherId;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm font-medium ${isMe
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
                            </div>
                            <div className="p-4 bg-white border-t border-slate-50 flex gap-2 items-end">
                                <label className="cursor-pointer p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = async () => {
                                                const base64 = reader.result as string;
                                                setSending(true);
                                                try {
                                                    // Send immediately or attach? sending immediately for simpler UX
                                                    const res = await sendMessage(currentTeacherId, activeStudent.id, "Sent an image", base64, 'image');
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
                                    className="bg-slate-50 border-slate-200 focus:ring-blue-500/20 h-12 rounded-xl"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <Button size="icon" className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 shrink-0" onClick={handleSend} disabled={sending}>
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-10">
                            <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <Mail className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Select a student</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Choose a conversation from the list to view details and reply to students.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
