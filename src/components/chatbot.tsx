"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ImageContent, User } from '@/lib/types';
import { answerQuestionsAboutStudyMaterials } from '@/ai/flows/answer-questions-about-study-materials';
import { userService } from '@/lib/user-service';
import { ChatIcon } from '@/components/icons/ChatIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Paperclip, Send, Sparkles, X, Gem } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const parts = reader.result.split(',');
                if (parts.length > 1) {
                    resolve(parts[1]);
                } else {
                    reject(new Error("Invalid data URL format."));
                }
            } else {
                reject(new Error("Failed to read blob as base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface ChatbotProps {
    user: User | null;
}

export default function Chatbot({ user }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState<ImageContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: crypto.randomUUID(),
                role: 'model',
                text: "Hello! I'm the StudyGenius assistant. Ask me anything about your study materials, or upload an image for analysis."
            }]);
        }
    }, [isOpen, messages.length]);
    
    useEffect(() => {
        if(textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 128)}px`;
        }
    }, [input]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const base64 = await blobToBase64(file);
            const url = URL.createObjectURL(file);
            setImage({ base64, mimeType: file.type, url });
        }
    };
    
    const removeImage = () => {
        setImage(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || (!input.trim() && !image)) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: input,
            ...(image && { imagePreview: image.url }),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInput('');
        const currentImage = image;
        setImage(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        try {
            // NOTE: The 'studyMaterials' property is empty as we don't have it in scope here.
            // A more advanced implementation would pass the current studySet context.
            const response = await answerQuestionsAboutStudyMaterials({
                studyMaterials: '',
                diagramDataUri: currentImage ? `data:${currentImage.mimeType};base64,${currentImage.base64}` : null,
                question: userMessage.text
            });

            const modelMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'model',
                text: response.answer,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'model',
                text: `Sorry, something went wrong: ${error.message}`,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform transform hover:scale-110"
                    aria-label="Open chat"
                >
                    <ChatIcon className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        StudyGenius Assistant
                    </SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="flex-1" ref={scrollAreaRef}>
                    <div className="space-y-4 p-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'rounded-br-lg bg-primary text-primary-foreground' : 'rounded-bl-lg bg-muted'}`}>
                                    {msg.imagePreview && <Image src={msg.imagePreview} alt="upload preview" width={200} height={200} className="rounded-lg mb-2 max-h-40 w-auto"/>}
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-end gap-2 justify-start">
                                <div className="max-w-[80%] p-3 rounded-2xl bg-muted">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="p-4 border-t bg-background sm:justify-start">
                    <form onSubmit={handleSubmit} className="w-full space-y-2">
                        {image && (
                            <div className="relative w-24">
                                <Image src={image.url} alt="upload preview" width={96} height={96} className="rounded-lg h-24 w-24 object-cover" />
                                <Button type="button" variant="destructive" size="icon" onClick={removeImage} className="absolute -top-2 -right-2 h-6 w-6 rounded-full"><X className="h-4 w-4" /></Button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                             <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="h-5 w-5"/>
                                            <span className="sr-only">Attach image</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Attach Image</TooltipContent>
                                </Tooltip>
                             </TooltipProvider>

                            <Textarea
                                ref={textAreaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Ask a question..."
                                rows={1}
                                className="flex-1 resize-none"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !image)}>
                                <Send className="h-5 w-5"/>
                                <span className="sr-only">Send message</span>
                            </Button>
                        </div>
                    </form>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
