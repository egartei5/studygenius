"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {Zap, BrainCircuit, BarChart} from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="animate-fade-in px-4 pb-24 pt-12 text-center flex flex-col items-center">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl mb-6">
                Master Any Subject <br/><span className="text-primary">In Seconds</span>
            </h1>
            <p className="max-w-2xl text-xl text-muted-foreground mb-10">
                StudyGenius uses advanced AI to instantly generate quizzes, flashcards, and games from your notes or any topic.
            </p>
            <Button 
                onClick={onGetStarted}
                size="lg"
                className="text-lg font-bold py-7 px-10 rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
                Get Started for Free
            </Button>
            
            <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
                 <Card className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <CardHeader>
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                            <Zap className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline">Instant Creation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Just type a topic or upload a PDF. We handle the rest.</p>
                    </CardContent>
                 </Card>
                 <Card className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <CardHeader>
                        <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4">
                            <BrainCircuit className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline">Active Recall</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Test yourself with scientifically proven study methods.</p>
                    </CardContent>
                 </Card>
                 <Card className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    <CardHeader>
                        <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500 mb-4">
                            <BarChart className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline">Track Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Monitor your learning streaks and mastery over time.</p>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
};
