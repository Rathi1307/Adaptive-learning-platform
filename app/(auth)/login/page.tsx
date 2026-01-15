"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, User, School } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError("Invalid email or password");
        } else {
            // Fetch session to check role mismatch (optional but good UX)
            // Ideally backend handles this, but for now we just redirect based on role
            // We assume the user logs into the correct tab. 
            // If a teacher logs in as student, role-based protection will just redirect them or show dashboard.
            if (role === "TEACHER") {
                router.push("/dashboard/teacher");
            } else {
                router.push("/dashboard/student");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />

            <Card className="w-[400px] glass border-white/40 shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-200">
                        {role === "STUDENT" ? <GraduationCap size={24} /> : <School size={24} />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                        {role === "STUDENT" ? "Student Login" : "Teacher Access"}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        {role === "STUDENT" ? "Welcome back, learner!" : "Manage your classroom effectively."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="STUDENT" onValueChange={(v) => setRole(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="STUDENT">Student</TabsTrigger>
                            <TabsTrigger value="TEACHER">Teacher</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@school.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-white/50"
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-white/50"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                            </div>
                            <Button className={`w-full mt-6 ${role === 'TEACHER' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`} type="submit">
                                Login as {role === "STUDENT" ? "Student" : "Teacher"}
                            </Button>
                        </form>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-slate-500">
                        Don't have an account? <a href="/register" className="text-blue-600 font-semibold hover:underline">Register</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
