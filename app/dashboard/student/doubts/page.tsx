"use client";

import { useState } from "react";
import { performOCR, chatWithAI } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Camera, Loader2, Send, BrainCircuit, Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentDoubtsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState("");
    const [aiSolution, setAiSolution] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSolving, setIsSolving] = useState(false);

    // Initial Chat State
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Preview Image
            if (selectedFile.type.startsWith("image/")) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setPreviewUrl(null);
            }

            // AUTO-START OCR
            setIsProcessing(true);
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await performOCR(formData);
            if (res.success) {
                setExtractedText(res.text || "");
            } else {
                alert("Could not extract text. Please try a clearer image or PDF.");
            }
            setIsProcessing(false);
        }
    };

    const handleGetSolution = async () => {
        if (!extractedText) return;

        setIsSolving(true);
        // Construct prompt using extracted text
        const prompt = `Can you solve this question for me?\n\nQuestion Text:\n${extractedText}`;

        // Add to local chat
        const newHistory = [...messages, { role: "user" as const, content: prompt }];
        setMessages(newHistory);

        // Call AI Action
        const res = await chatWithAI(newHistory.map(m => ({ ...m, role: m.role as "user" | "assistant" | "system" })), prompt);

        if (res.success) {
            setAiSolution(res.message);
            setMessages([...newHistory, { role: "assistant" as const, content: res.message }]);
        } else {
            setAiSolution("Sorry, I couldn't connect to the AI tutor right now.");
        }
        setIsSolving(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                    <Camera className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">InstaSolve</h1>
                    <p className="text-slate-500">Snap a picture of your doubt and get an instant solution.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* LEFT: UPLOAD & PREVIEW */}
                <div className="space-y-6">
                    <Card className="border-2 border-dashed border-slate-200 shadow-sm hover:border-purple-300 transition-all">
                        <CardContent className="flex flex-col items-center justify-center p-10 text-center relative min-h-[300px]">
                            {previewUrl ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img src={previewUrl} alt="Preview" className="max-h-[300px] rounded-lg shadow-sm" />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="mt-4 absolute bottom-0 bg-white/90 hover:bg-white shadow-md text-red-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                            setPreviewUrl(null);
                                            setExtractedText("");
                                            setAiSolution("");
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                        <UploadCloud className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-700">Click to Upload Problem</p>
                                    <p className="text-sm text-slate-400 mt-1">Supports Images & PDFs</p>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* EXTRACTED TEXT EDITOR */}
                    {extractedText && (
                        <Card className="animate-in fade-in slide-in-from-bottom-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Extracted Question
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={extractedText}
                                    onChange={(e) => setExtractedText(e.target.value)}
                                    className="min-h-[100px] font-medium text-slate-800 bg-slate-50 border-slate-200"
                                />
                                <Button
                                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 font-bold"
                                    onClick={handleGetSolution}
                                    disabled={isSolving}
                                >
                                    {isSolving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BrainCircuit className="h-4 w-4 mr-2" />}
                                    Solve with AI
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT: AI SOLUTION */}
                <Card className="h-full min-h-[500px] flex flex-col border-slate-200 shadow-md">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-600" />
                            AI Tutor Solution
                        </CardTitle>
                        <CardDescription>Step-by-step explanation</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                        {aiSolution ? (
                            <div className="prose prose-purple prose-sm max-w-none">
                                <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">
                                    {aiSolution}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                                <BrainCircuit className="h-16 w-16 opacity-20" />
                                <p>Upload a question to see the magic happening!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Icon helper
function FileText({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    )
}
