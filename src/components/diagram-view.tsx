"use client";

import React from 'react';
import type { DiagramQuestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface DiagramViewProps {
  imageSrc: string;
  questions: DiagramQuestion[];
}

export const DiagramView: React.FC<DiagramViewProps> = ({ imageSrc, questions }) => {
  if (!questions || questions.length === 0) {
    return <p className="text-center text-muted-foreground">No diagram questions were generated for this image.</p>;
  }

  return (
    <div className="space-y-6">
      <CardHeader className="text-center p-0">
        <CardTitle className="text-xl font-bold font-headline">Diagram Analysis</CardTitle>
      </CardHeader>
      <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
        <Image src={imageSrc} alt="User-uploaded diagram" width={600} height={400} className="max-w-full max-h-96 object-contain rounded-md shadow-md" data-ai-hint="diagram chart" />
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">{index + 1}. {q.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm pt-0">
                <Card className="bg-green-500/10 border-green-500/20 p-4">
                    <p><span className="font-bold text-green-700 dark:text-green-300">Answer:</span> <span className="text-green-600 dark:text-green-400">{q.answer}</span></p>
                    <p className="mt-1"><span className="font-bold text-green-700 dark:text-green-300">Explanation:</span> <span className="text-green-600 dark:text-green-400">{q.explanation}</span></p>
                </Card>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
