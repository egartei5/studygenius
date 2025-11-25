// src/ai/flows/answer-questions-with-chatbot.ts
'use server';
/**
 * @fileOverview An AI agent to answer user questions about a specific topic.
 *
 * - answerQuestions - A function that takes a topic and a question and returns an answer.
 * - AnswerQuestionsInput - The input type for the answerQuestions function.
 * - AnswerQuestionsOutput - The return type for the answerQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic the user is asking about.'),
  question: z.string().describe('The user question about the topic.'),
});
export type AnswerQuestionsInput = z.infer<typeof AnswerQuestionsInputSchema>;

const AnswerQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AnswerQuestionsOutput = z.infer<typeof AnswerQuestionsOutputSchema>;

export async function answerQuestions(input: AnswerQuestionsInput): Promise<AnswerQuestionsOutput> {
  return answerQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsPrompt',
  input: { schema: AnswerQuestionsInputSchema },
  output: { schema: AnswerQuestionsOutputSchema },
  prompt: `You are a helpful AI assistant who answers questions about a specific topic.

  Topic: {{{topic}}}

  Question: {{{question}}}

  Answer:`,
});

const answerQuestionsFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFlow',
    inputSchema: AnswerQuestionsInputSchema,
    outputSchema: AnswerQuestionsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
