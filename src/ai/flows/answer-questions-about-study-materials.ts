// src/ai/flows/answer-questions-about-study-materials.ts
'use server';
/**
 * @fileOverview An AI agent to answer user questions about the generated study materials or uploaded diagrams.
 *
 * - answerQuestionsAboutStudyMaterials - A function that takes study materials, a diagram, and a question and returns an answer.
 * - AnswerQuestionsAboutStudyMaterialsInput - The input type for the answerQuestionsAboutStudyMaterials function.
 * - AnswerQuestionsAboutStudyMaterialsOutput - The return type for the answerQuestionsAboutStudyMaterials function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerQuestionsAboutStudyMaterialsInputSchema = z.object({
  studyMaterials: z.string().describe('The generated study materials (e.g., flashcards, quizzes).'),
  diagramDataUri: z.string().nullable().describe('Optional: A diagram related to the study materials, as a data URI.'),
  question: z.string().describe('The user question about the study materials or diagram.'),
});
export type AnswerQuestionsAboutStudyMaterialsInput = z.infer<typeof AnswerQuestionsAboutStudyMaterialsInputSchema>;

const AnswerQuestionsAboutStudyMaterialsOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question, based on the study materials and diagram.'),
});
export type AnswerQuestionsAboutStudyMaterialsOutput = z.infer<typeof AnswerQuestionsAboutStudyMaterialsOutputSchema>;

export async function answerQuestionsAboutStudyMaterials(input: AnswerQuestionsAboutStudyMaterialsInput): Promise<AnswerQuestionsAboutStudyMaterialsOutput> {
  return answerQuestionsAboutStudyMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutStudyMaterialsPrompt',
  input: { schema: AnswerQuestionsAboutStudyMaterialsInputSchema },
  output: { schema: AnswerQuestionsAboutStudyMaterialsOutputSchema },
  prompt: `You are a helpful AI assistant who answers questions about study materials. Use the provided study materials and diagram (if available) to answer the user's question.

Study Materials:
{{studyMaterials}}

{{#if diagramDataUri}}
Diagram:
{{media url=diagramDataUri}}
{{/if}}

Question: {{{question}}}

Answer: `,
});

const answerQuestionsAboutStudyMaterialsFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutStudyMaterialsFlow',
    inputSchema: AnswerQuestionsAboutStudyMaterialsInputSchema,
    outputSchema: AnswerQuestionsAboutStudyMaterialsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
