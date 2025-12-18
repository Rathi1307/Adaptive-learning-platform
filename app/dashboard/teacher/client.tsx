"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Chatbot } from "@/components/chatbot";
import { LayoutDashboard, LogOut, Users, Clock, CheckSquare, BrainCircuit, ArrowLeft, FolderOpen, BarChart3, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";

interface TeacherDashboardClientProps {
    userData: {
        name?: string | null;
        email?: string | null;
    };
    initialData: {
        clusters: any[];
        students: any[];
        classPerformance: any[];
    };
}

export default function TeacherDashboardClient({ userData, initialData }: TeacherDashboardClientProps) {
    const [selectedCluster, setSelectedCluster] = useState<typeof initialData.clusters[0] | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<typeof initialData.students[0] | null>(null);

    const handleGenerateQuiz = (type: "end-of-class" | "retention") => {
        alert(`Generating ${type === "end-of-class" ? "End of Class" : "Retention"} Quiz for ${selectedCluster?.name}...`);
    };

    const ClusterList = () => (
        <div className="space-y-8">
            {/* Global Analytics Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900">Class Performance</CardTitle>
                            <BarChart3 className="h-4 w-4 text-slate-400" />
                        </div>
                        <CardDescription className="text-xs">Average scores across all subjects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={initialData.classPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} barSize={40}>
                                    {initialData.classPerformance.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900">Activity Heatmap</CardTitle>
                            <Activity className="h-4 w-4 text-slate-400" />
                        </div>
                        <CardDescription className="text-xs">Student activity over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5 mt-2">
                            {initialData.students.slice(0, 5).map((student: any) => (
                                <div key={student.id} className="flex items-center gap-4">
                                    <div className="w-24 text-xs font-medium truncate text-slate-600">{student.name}</div>
                                    <div className="flex gap-1.5 flex-1">
                                        {/* Mock activity data since we don't have it in DB yet */}
                                        {[4, 2, 5, 7, 3, 6, 8].map((count, i) => (
                                            <div
                                                key={i}
                                                className={`h-6 w-6 rounded-[4px] transition-all hover:scale-110 ${count === 0 ? "bg-slate-100" :
                                                    count < 3 ? "bg-blue-100" :
                                                        count < 6 ? "bg-blue-300" :
                                                            "bg-blue-600"
                                                    }`}
                                                title={`${count} tasks`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Your Clusters</h2>
                        <p className="text-slate-500 text-sm">Select a folder to manage teaching and view reports.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        New Cluster
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {initialData.clusters.map((cluster) => (
                        <div
                            key={cluster.id}
                            className="group cursor-pointer relative"
                            onClick={() => setSelectedCluster(cluster)}
                        >
                            {/* Folder Tab */}
                            <div className={`w-24 h-3 rounded-t-md bg-gradient-to-r ${cluster.color || 'from-blue-500 to-cyan-500'} opacity-90 ml-0`} />

                            {/* Folder Body */}
                            <Card className="border border-slate-200 shadow-sm bg-white relative z-10 rounded-tl-none group-hover:-translate-y-1 transition-all duration-200 group-hover:shadow-md group-hover:border-blue-200">
                                <div className={`h-1 w-full bg-gradient-to-r ${cluster.color || 'from-blue-500 to-cyan-500'}`} />
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span className="flex items-center gap-2 font-bold text-slate-800">
                                            <FolderOpen className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                            {cluster.name}
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-xs line-clamp-1">{cluster.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                                            <Users className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="font-medium">{cluster.students.length} Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="font-medium">{cluster.schedule?.duration || '60 mins'}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Class</p>
                                        <p className="font-semibold text-sm text-slate-900 truncate">{cluster.schedule?.topic || 'General Session'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const ClusterDetail = () => {
        if (!selectedCluster) return null;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedCluster(null)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{selectedCluster.name}</h2>
                        <p className="text-slate-500">Manage schedule, checklist, and students.</p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white p-1 rounded-xl border shadow-sm">
                        <TabsTrigger value="overview">Overview & Schedule</TabsTrigger>
                        <TabsTrigger value="students">Student Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Schedule Card */}
                            <Card className="border border-slate-200 shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        Today's Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-blue-900">{selectedCluster.schedule?.topic || 'No topic'}</h3>
                                                <p className="text-blue-600 font-medium">{selectedCluster.schedule?.time || 'TBD'}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold shadow-sm">
                                                {selectedCluster.schedule?.duration || '60 mins'}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-blue-800">Teaching Checklist:</p>
                                            {selectedCluster.checklist?.map((item: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Checkbox id={`cl-${i}`} checked={item.completed} className="border-blue-400 data-[state=checked]:bg-blue-600" />
                                                    <label htmlFor={`cl-${i}`} className="text-sm text-blue-700 cursor-pointer">
                                                        {item.task}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quiz Generation */}
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BrainCircuit className="h-5 w-5 text-purple-500" />
                                        Quiz Generation
                                    </CardTitle>
                                    <CardDescription>Auto-generate quizzes based on study material.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-purple-900">End of Class Quiz</h4>
                                            <p className="text-xs text-purple-600">Test understanding of today's topic.</p>
                                        </div>
                                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleGenerateQuiz("end-of-class")}>
                                            Generate
                                        </Button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-emerald-900">Retention Quiz</h4>
                                            <p className="text-xs text-emerald-600">Check retention for tomorrow.</p>
                                        </div>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleGenerateQuiz("retention")}>
                                            Generate
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="students">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>Detailed Report Cards</CardTitle>
                                <CardDescription>Individual progress and remarks for {selectedCluster.name}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead>Skill Level</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCluster.students.map((student: any) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                            {/* Mock progress % for now, or fetch aggregated if available */}
                                                            <div className="h-full bg-blue-500" style={{ width: '45%' }} />
                                                        </div>
                                                        <span className="text-xs font-bold">45%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${student.skillLevel === "BEGINNER" ? "bg-red-50 text-red-700 border-red-200" :
                                                        student.skillLevel === "INTERMEDIATE" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                            "bg-green-50 text-green-700 border-green-200"
                                                        }`}>
                                                        {student.skillLevel}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                                                        View Report
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <LayoutDashboard className="h-6 w-6 text-blue-600" />
                        <span>AdaptiveLearn <span className="text-slate-400 font-normal">Teacher</span></span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900">{userData.name}</p>
                            <p className="text-xs text-slate-500">{userData.email}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => signOut({ callbackUrl: "/login" })}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto">
                {selectedCluster ? <ClusterDetail /> : <ClusterList />}
            </div>

            {/* Student Detail Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{selectedStudent?.name}'s Performance</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="py-6 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-slate-50">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Email Address</p>
                                    <p className="font-semibold text-slate-900">{selectedStudent.email}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Skill Level</p>
                                    <p className="font-semibold text-slate-900">{selectedStudent.skillLevel}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-6 text-lg font-bold text-slate-900">Quiz Performance History</h4>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={selectedStudent.quizResults?.map((r: any) => ({
                                            quiz: r.quiz?.chapter?.title || 'Quiz',
                                            score: r.score
                                        })).reverse() || []}>
                                            <XAxis dataKey="quiz" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Chatbot />
        </div>
    );
}
