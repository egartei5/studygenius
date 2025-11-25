"use client";

import React, { useState } from 'react';
import type { Flashcard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

interface FlashcardViewProps {
  flashcards: Flashcard[];
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <p className="text-center text-muted-foreground">No flashcards were generated for this topic.</p>;
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
     setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const card = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-lg h-80 perspective-1000">
        <div
          className={`relative w-full h-full cursor-pointer transform-style-preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div className="absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-border bg-card p-6 shadow-lg backface-hidden">
            <p className="text-center text-2xl font-semibold text-card-foreground">{card.front}</p>
          </div>
          {/* Back of card */}
          <div className="absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-primary bg-primary p-6 text-primary-foreground shadow-lg backface-hidden rotate-y-180">
            <p className="text-center text-lg">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <Button onClick={handlePrev} variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button onClick={() => setIsFlipped(!isFlipped)} className="px-8 py-3 w-32 font-bold">
          <RefreshCw className="mr-2 h-4 w-4" /> Flip
        </Button>
        <Button onClick={handleNext} variant="outline" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
};
