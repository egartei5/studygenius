"use client";

import React, { useState } from 'react';
import type { MCQ, ShortAnswerQuestion, Feedback } from '@/lib/types';
import { getAnswerFeedback } from '@/ai/flows/get-answer-feedback-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { userService } from '@/lib/user-service';

interface QuizViewProps {
  mcqs: MCQ[];
  shortAnswers: ShortAnswerQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ mcqs, shortAnswers }) => {
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showMcqAnswer, setShowMcqAnswer] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  const [currentShortAnswerIndex, setCurrentShortAnswerIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: number]: Feedback | null }>({});
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [saqError, setSaqError] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    if (showMcqAnswer) return;
    setSelectedOption(option);
    setShowMcqAnswer(true);
    if (option === mcqs[currentMcqIndex].correctAnswer) {
      setMcqScore(prev => prev + 1);
      userService.incrementStats('questionsAnswered');
    }
  };

  const handleNextMcq = () => {
    setShowMcqAnswer(false);
    setSelectedOption(null);
    setCurrentMcqIndex(prev => prev + 1);
  };
  
  const handleRestartMcqs = () => {
    setCurrentMcqIndex(0);
    setSelectedOption(null);
    setShowMcqAnswer(false);
    setMcqScore(0);
  };
  
  const handleNextShortAnswer = () => {
    setSaqError(null);
    setCurrentShortAnswerIndex(prev => prev + 1);
  };
  
  const handleRestartShortAnswers = () => {
      setCurrentShortAnswerIndex(0);
      setUserAnswers({});
      setFeedback({});
      setSaqError(null);
  }

  const handleUserAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserAnswers(prev => ({ ...prev, [currentShortAnswerIndex]: e.target.value }));
  };

  const handleCheckAnswer = async () => {
      const userAnswer = userAnswers[currentShortAnswerIndex];
      if (!userAnswer || !userAnswer.trim()) return;

      setIsCheckingAnswer(true);
      setSaqError(null);
      
      const saq = shortAnswers[currentShortAnswerIndex];

      try {
          const result = await getAnswerFeedback({ question: saq.question, idealAnswer: saq.answer, userAnswer });
          setFeedback(prev => ({...prev, [currentShortAnswerIndex]: result}));
          userService.incrementStats('questionsAnswered');
      } catch (e: any) {
          setSaqError(e.message || "Failed to get feedback.");
      } finally {
          setIsCheckingAnswer(false);
      }
  };
  
  const renderFeedback = (fb: Feedback) => {
    let variant: "default" | "destructive" = "default";
    let title = "Feedback";
    if (fb.verdict === 'Correct') {
        variant = "default";
        title = "Correct!";
    } else if (fb.verdict === 'Partially Correct') {
        variant = "default";
        title = "Partially Correct";
    } else {
        variant = "destructive";
        title = "Incorrect";
    }
    
    return (
        <Alert variant={variant} className={variant === 'default' ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300' : ''}>
            <AlertTitle className="font-bold">{title}</AlertTitle>
            <AlertDescription>{fb.explanation}</AlertDescription>
        </Alert>
    );
  };

  const renderMcq = () => {
    if (!mcqs || mcqs.length === 0) return null;
    
    if (currentMcqIndex >= mcqs.length) {
      return (
        <Card className="text-center bg-green-500/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-700 dark:text-green-300">MCQ Section Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 dark:text-green-400 mt-2">Your score: {mcqScore} / {mcqs.length}</p>
            <Button onClick={handleRestartMcqs} className="mt-4">Restart MCQs</Button>
          </CardContent>
        </Card>
      );
    }

    const mcq = mcqs[currentMcqIndex];
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-muted-foreground">
          Multiple-Choice Question {currentMcqIndex + 1} of {mcqs.length}
        </h3>
        <p className="text-xl font-medium text-foreground">{mcq.question}</p>
        <div className="space-y-3">
          {mcq.options.map((option, index) => {
            const isCorrect = option === mcq.correctAnswer;
            const isSelected = option === selectedOption;
            
            let variant: "outline" | "default" = "outline";
            let stateClass = "";
            
            if (showMcqAnswer) {
              if (isCorrect) stateClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 hover:bg-green-500/20";
              else if (isSelected && !isCorrect) stateClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 hover:bg-red-500/20";
              else stateClass = "text-muted-foreground cursor-not-allowed";
            }
            
            return (
              <Button key={index} onClick={() => handleOptionSelect(option)} disabled={showMcqAnswer} variant={variant} className={`w-full justify-between h-auto py-3 px-4 text-base ${stateClass}`}>
                <span>{option}</span>
                {showMcqAnswer && isCorrect && <Check className="h-5 w-5 text-green-500"/>}
                {showMcqAnswer && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500"/>}
              </Button>
            );
          })}
        </div>
        {showMcqAnswer && (
          <Alert className="animate-fade-in bg-primary/10 border-primary/20">
            <AlertTitle className="font-bold text-primary">Explanation</AlertTitle>
            <AlertDescription className="text-primary/90">{mcq.explanation}</AlertDescription>
            <Button onClick={handleNextMcq} className="mt-4">
              Next Question
            </Button>
          </Alert>
        )}
      </div>
    );
  };
  
  const renderShortAnswer = () => {
    if (!shortAnswers || shortAnswers.length === 0) return null;

    if (currentShortAnswerIndex >= shortAnswers.length) {
      return (
        <Card className="text-center bg-green-500/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-700 dark:text-green-300">Short Answer Section Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRestartShortAnswers} className="mt-4">Restart Short Answers</Button>
          </CardContent>
        </Card>
      );
    }
    
    const saq = shortAnswers[currentShortAnswerIndex];
    const currentFeedback = feedback[currentShortAnswerIndex];
    const currentUserAnswer = userAnswers[currentShortAnswerIndex] || '';

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-muted-foreground">
          Short Answer Question {currentShortAnswerIndex + 1} of {shortAnswers.length}
        </h3>
        <p className="text-xl font-medium text-foreground">{saq.question}</p>
        
        <Textarea
            value={currentUserAnswer}
            onChange={handleUserAnswerChange}
            placeholder="Type your answer here..."
            rows={4}
            disabled={!!currentFeedback || isCheckingAnswer}
        />

        { !currentFeedback && (
            <div>
                <Button 
                    onClick={handleCheckAnswer} 
                    disabled={isCheckingAnswer || !currentUserAnswer.trim()}
                >
                    {isCheckingAnswer && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isCheckingAnswer ? 'Checking...' : 'Check Answer'}
                </Button>
            </div>
        )}
        
        {saqError && <p className="text-sm text-destructive">{saqError}</p>}

        {currentFeedback && (
          <div className="space-y-4 animate-fade-in">
              {renderFeedback(currentFeedback)}
              
              <Alert>
                <AlertTitle className="font-bold">Ideal Answer</AlertTitle>
                <AlertDescription>{saq.answer}</AlertDescription>
              </Alert>

             <Button onClick={handleNextShortAnswer} variant="secondary">
              Next Question
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {renderMcq()}
      {mcqs.length > 0 && shortAnswers.length > 0 && <hr className="my-8 border-t-2 border-border"/>}
      {renderShortAnswer()}
      {mcqs.length === 0 && shortAnswers.length === 0 && <p className="text-center text-muted-foreground">No quiz questions were generated for this topic.</p>}
    </div>
  );
};
