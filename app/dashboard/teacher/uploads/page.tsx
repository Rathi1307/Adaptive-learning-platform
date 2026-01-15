"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadModelAnswer, performOCR } from "@/app/actions";
import { UploadCloud, CheckCircle, FileText, Loader2 } from "lucide-react";

export default function TeacherUploadsPage() {
    const [standard, setStandard] = useState("10");
    const [subject, setSubject] = useState("");
    const [unit, setUnit] = useState(""); // Chapter/Unit name
    const [file, setFile] = useState<File | null>(null);
    const [ocrPreview, setOcrPreview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Mock OCR processing
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setIsUploading(true);

            // Perform server-side OCR
            const formData = new FormData();
            formData.append("file", selectedFile);

            console.log("Sending file to OCR...", selectedFile.name);
            const res = await performOCR(formData);

            if (res.success) {
                setOcrPreview(res.text || "No text extracted.");
            } else {
                alert("OCR Failed: " + res.error);
                setOcrPreview("");
            }
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!file || !ocrPreview || !subject || !unit) {
            alert("Please fill all fields and upload a file.");
            return;
        }

        setIsSaving(true);
        // Mock File URL (in prod, upload to S3 first)
        const mockFileUrl = `https://generated-storage.com/${file.name}`;

        const result = await uploadModelAnswer(standard, subject, unit, mockFileUrl, ocrPreview);

        setIsSaving(false);
        if (result.success) {
            alert("Model Answer Saved Successfully!");
            // Reset form
            setSubject("");
            setUnit("");
            setFile(null);
            setOcrPreview("");
        } else {
            alert("Failed to save: " + result.error);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Model Answers</h1>
                <p className="text-slate-500 mt-2">
                    Upload reference materials and answer keys. The AI will use these to grade student homework.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* LEFT COLUMN: UPLOAD FORM */}
                <Card>
                    <CardHeader>
                        <CardTitle>Answer Key Details</CardTitle>
                        <CardDescription>Specify the curriculum context</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Class / Standard</Label>
                            <Select value={standard} onValueChange={setStandard}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((std) => (
                                        <SelectItem key={std} value={std}>Class {std}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="e.g. Science, Mathematics"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Chapter / Unit Name</Label>
                            <Input
                                placeholder="e.g. Life Processes"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label>Upload PDF / Image</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <Input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                />
                                <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                                <p className="text-sm font-medium text-slate-700">
                                    {file ? file.name : "Click to browse or drag file"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: PREVIEW */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>OCR Preview</span>
                            {isUploading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        </CardTitle>
                        <CardDescription>Verify the extracted text before saving</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <Textarea
                            className="flex-1 min-h-[300px] font-mono text-xs leading-relaxed"
                            placeholder="Extracted text will appear here..."
                            value={ocrPreview}
                            onChange={(e) => setOcrPreview(e.target.value)}
                        />

                        <Button
                            className="w-full gap-2"
                            onClick={handleSave}
                            disabled={!file || !ocrPreview || isSaving}
                        >
                            {isSaving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><CheckCircle className="h-4 w-4" /> Save to Database</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
