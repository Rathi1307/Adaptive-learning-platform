"use client";

import { chatWithAI } from "@/app/actions";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Maximize2, Minimize2, Send, Bot, User, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 380, height: 500 });
    const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
        { role: "bot", content: "Hello! I am your AI learning assistant. How can I help you today?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: "user" as const, content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            // Map UI roles to API roles
            // UI "bot" -> API "assistant"
            const history = updatedMessages.map(m => ({
                role: m.role === "bot" ? "assistant" : "user",
                content: m.content
            })) as { role: "user" | "assistant"; content: string }[];

            // app/actions expects history WITHOUT the last message (which is passed as newMessage)
            const historyForApi = history.slice(0, -1);

            console.log("SENDING HISTORY:", JSON.stringify(historyForApi, null, 2)); // DEBUG
            const response = await chatWithAI(historyForApi, input);

            if (response.success && response.message) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: response.message || "" }
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: "I'm having trouble connecting right now. Please check your internet or API key." }
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Something went wrong. Please try again." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Resize Logic
    const startResizing = (mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        const startX = mouseDownEvent.clientX;
        const startY = mouseDownEvent.clientY;
        const startWidth = dimensions.width;
        const startHeight = dimensions.height;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            // Calculate new dimensions (dragging top-left corner changes width and height)
            // Delta X: moving left (negative) increases width
            // Delta Y: moving up (negative) increases height
            const newWidth = Math.max(300, startWidth - (mouseMoveEvent.clientX - startX));
            const newHeight = Math.max(400, startHeight - (mouseMoveEvent.clientY - startY));

            // Constrain to screen size approximately
            const maxWidth = window.innerWidth - 40;
            const maxHeight = window.innerHeight - 40;

            setDimensions({
                width: Math.min(newWidth, maxWidth),
                height: Math.min(newHeight, maxHeight)
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full h-14 w-14 p-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
                >
                    <MessageCircle className="h-7 w-7 text-white" />
                </Button>
            )}

            {isOpen && (
                <div
                    style={{
                        width: isMaximized ? "calc(100vw - 2rem)" : `${dimensions.width}px`,
                        height: isMaximized ? "calc(100vh - 2rem)" : `${dimensions.height}px`,
                        transition: isMaximized ? "all 0.3s ease-in-out" : "none"
                    }}
                    className="relative bg-background rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 overscroll-contain isolate"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0 z-20">
                        <div className="flex items-center gap-2 select-none">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">AI Study Buddy</span>
                                <span className="text-[10px] text-blue-100 opacity-90">Always here to help</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setIsMaximized(!isMaximized)}>
                                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/50 p-4 relative z-10">
                        <div className="space-y-6" ref={scrollAreaRef}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    ref={i === messages.length - 1 ? lastMessageRef : null}
                                    className={`flex w-full gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "bot" && (
                                        <Avatar className="h-8 w-8 shrink-0 mt-1">
                                            <AvatarFallback className="bg-blue-100 text-blue-600 border border-blue-200">AI</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none"
                                            }`}
                                    >
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {msg.role === "user" && (
                                        <Avatar className="h-8 w-8 shrink-0 mt-1">
                                            <AvatarFallback className="bg-slate-200 text-slate-600">ME</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex w-full gap-3 justify-start">
                                    <Avatar className="h-8 w-8 shrink-0 mt-1">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 border border-blue-200">AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="flex space-x-2 items-center h-5">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-background border-t shrink-0 z-20">
                        <div className="relative flex items-center">
                            <Input
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="pr-12 py-6 rounded-full border-slate-200 dark:border-slate-700 shadow-sm focus-visible:ring-blue-500"
                            />
                            <Button
                                size="sm"
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="absolute right-1.5 top-1.5 rounded-full h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
                            >
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                        <div className="text-[10px] text-center text-muted-foreground mt-2">
                            AI can make mistakes. Check important info.
                        </div>
                    </div>

                    {/* Resize Handle (Top-Left) - MOVED TO END & HIGH Z-INDEX */}
                    {!isMaximized && (
                        <div
                            onMouseDown={startResizing}
                            className="absolute top-0 left-0 w-8 h-8 z-[100] cursor-nw-resize flex items-start justify-start p-1 bg-transparent hover:bg-blue-500/10 transition-colors rounded-br-2xl group"
                            title="Drag to resize"
                        >
                            <div className="w-3 h-3 border-t-2 border-l-2 border-primary/50 group-hover:border-blue-600 rounded-tl-md transition-colors" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
