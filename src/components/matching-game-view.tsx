"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { MatchingPair } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const MatchingGameView: React.FC<{ pairs: MatchingPair[] }> = ({ pairs }) => {
  const [terms, setTerms] = useState<MatchingPair[]>([]);
  const [definitions, setDefinitions] = useState<MatchingPair[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<MatchingPair | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [incorrect, setIncorrect] = useState<MatchingPair | null>(null);

  useEffect(() => {
    setTerms(shuffleArray(pairs));
    setDefinitions(shuffleArray(pairs));
    setMatches([]);
    setSelectedTerm(null);
  }, [pairs]);

  if (!pairs || pairs.length === 0) {
    return <p className="text-center text-muted-foreground">No matching game was generated for this topic.</p>;
  }
  
  const handleTermSelect = (term: MatchingPair) => {
    if (matches.includes(term.term)) return;
    setSelectedTerm(term);
    setIncorrect(null);
  };
  
  const handleDefinitionSelect = (def: MatchingPair) => {
    if (!selectedTerm || matches.includes(def.term)) return;

    if (selectedTerm.term === def.term) {
      setMatches(prev => [...prev, selectedTerm.term]);
      setSelectedTerm(null);
      setIncorrect(null);
    } else {
      setIncorrect(def);
      setTimeout(() => {
        setIncorrect(null);
        setSelectedTerm(null);
      }, 800);
    }
  };

  const handleReset = () => {
      setTerms(shuffleArray(pairs));
      setDefinitions(shuffleArray(pairs));
      setMatches([]);
      setSelectedTerm(null);
      setIncorrect(null);
  }

  const allMatched = matches.length === pairs.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">Match each term with its correct definition.</p>
        <Button onClick={handleReset} variant="secondary" size="sm">
            Reset
        </Button>
      </div>

      {allMatched ? (
         <Card className="text-center p-8 bg-green-500/10 border-green-500/20">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">Congratulations!</h3>
            <p className="text-green-600 dark:text-green-400 mt-1">You've matched all the pairs correctly.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-3">
              {terms.map((pair) => {
                const isSelected = selectedTerm?.term === pair.term;
                const isMatched = matches.includes(pair.term);
                return(
                  <Button key={`term-${pair.term}`} onClick={() => handleTermSelect(pair)} disabled={isMatched} variant="outline" className={cn("w-full p-4 h-auto text-left justify-start", isMatched ? "bg-green-500/10 border-green-500/30 text-muted-foreground cursor-not-allowed" : isSelected ? "border-primary ring-2 ring-primary" : "bg-card")}>
                      {pair.term}
                  </Button>
                );
              })}
            </div>
            <div className="space-y-3">
                {definitions.map((pair) => {
                  const isMatched = matches.includes(pair.term);
                  const isIncorrect = incorrect?.term === pair.term;
                  return (
                    <Button key={`def-${pair.term}`} onClick={() => handleDefinitionSelect(pair)} disabled={isMatched || !selectedTerm} variant="outline" className={cn("w-full p-4 h-auto text-left justify-start", isMatched ? "bg-green-500/10 border-green-500/30 text-muted-foreground cursor-not-allowed" : isIncorrect ? "bg-destructive/10 border-destructive/30" : "bg-card")}>
                        {pair.definition}
                    </Button>
                  );
                })}
            </div>
        </div>
      )}
    </div>
  );
};
