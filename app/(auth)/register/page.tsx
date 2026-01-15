'use client'

import { useState } from 'react'
import { registerStudent, registerTeacher } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { GraduationCap, ArrowRight, CheckCircle2, School } from 'lucide-react'

export default function RegisterPage() {
    const [result, setResult] = useState<{ success: boolean, clusterName?: string, error?: string, user?: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("student");

    async function onStudentSubmit(formData: FormData) {
        setLoading(true);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const age = parseInt(formData.get('age') as string);
        const score = parseInt(formData.get('score') as string);

        const res = await registerStudent(name, email, password, age, score);
        setResult(res);
        setLoading(false);
    }

    async function onTeacherSubmit(formData: FormData) {
        setLoading(true);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const res = await registerTeacher(name, email, password);
        setResult(res);
        setLoading(false);
    }

    if (result?.success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
                <Card className="w-full max-w-md border-green-200 bg-green-50 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-green-800">Registration Successful!</CardTitle>
                        <CardDescription className="text-green-700">
                            Welcome to the school.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        {result.clusterName ? (
                            <>
                                <p className="text-slate-700">
                                    Based on your age and entrance test performance, you have been allocated to:
                                </p>
                                <div className="text-3xl font-bold text-green-700 my-4">
                                    Cluster: {result.clusterName}
                                </div>
                            </>
                        ) : (
                            <p className="text-slate-700">
                                Teacher account created. You can now access the grading dashboard.
                            </p>
                        )}
                        <p className="text-sm text-slate-500">
                            You can now log in with your credentials.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/login" className="w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700">Go to Login</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        {activeTab === "student" ? <GraduationCap className="h-6 w-6 text-blue-600" /> : <School className="h-6 w-6 text-purple-600" />}
                        <span className="font-bold text-lg text-slate-900">Adaptive School</span>
                    </div>
                    <CardTitle>{activeTab === "student" ? "Student Registration" : "Teacher Registration"}</CardTitle>
                    <CardDescription>
                        {activeTab === "student" ? "Enter details & test score to get allocated." : "Create your faculty account."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="student" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="student">Student</TabsTrigger>
                            <TabsTrigger value="teacher">Teacher</TabsTrigger>
                        </TabsList>

                        <TabsContent value="student">
                            <form action={onStudentSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="s-name">Full Name</Label>
                                    <Input id="s-name" name="name" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="s-email">Email Address</Label>
                                    <Input id="s-email" name="email" type="email" placeholder="john@student.com" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age (Years)</Label>
                                        <Input id="age" name="age" type="number" min="5" max="18" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="score">Entrance Score (0-100)</Label>
                                        <Input id="score" name="score" type="number" min="0" max="100" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="s-password">Password</Label>
                                    <Input id="s-password" name="password" type="password" placeholder="******" required />
                                </div>
                                {result?.error && (
                                    <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                                        Error: {result.error}
                                    </div>
                                )}
                                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                                    {loading ? "Allocating..." : "Register Student"} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="teacher">
                            <form action={onTeacherSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="t-name">Full Name</Label>
                                    <Input id="t-name" name="name" placeholder="Prof. Snape" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="t-email">School Email</Label>
                                    <Input id="t-email" name="email" type="email" placeholder="teacher@school.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="t-password">Password</Label>
                                    <Input id="t-password" name="password" type="password" placeholder="******" required />
                                </div>
                                {result?.error && (
                                    <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                                        Error: {result.error}
                                    </div>
                                )}
                                <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 mt-2">
                                    {loading ? "Creating..." : "Register as Teacher"} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-xs text-muted-foreground">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link></p>
                </CardFooter>
            </Card>
        </div>
    )
}
