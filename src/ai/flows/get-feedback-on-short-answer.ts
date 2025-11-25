// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent for evaluating student answers on short answer questions and providing feedback.
 *
 * - getFeedbackOnShortAnswer - A function that handles the evaluation process.
 * - GetFeedbackOnShortAnswerInput - The input type for the getFeedbackOnShortAnswer function.
 * - GetFeedbackOnShortAnswerOutput - The return type for the getFeedbackOnShortAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetFeedbackOnShortAnswerInputSchema = z.object({
  question: z.string().describe('The short answer question that was asked.'),
  idealAnswer: z.string().describe('The ideal answer to the question.'),
  userAnswer: z.string().describe('The student’s answer to the short answer question.'),
});
export type GetFeedbackOnShortAnswerInput = z.infer<typeof GetFeedbackOnShortAnswerInputSchema>;

const GetFeedbackOnShortAnswerOutputSchema = z.object({
  verdict: z.enum(['Correct', 'Partially Correct', 'Incorrect']).describe('The evaluation verdict.'),
  explanation: z.string().describe('The explanation for the verdict.'),
});
export type GetFeedbackOnShortAnswerOutput = z.infer<typeof GetFeedbackOnShortAnswerOutputSchema>;

export async function getFeedbackOnShortAnswer(input: GetFeedbackOnShortAnswerInput): Promise<GetFeedbackOnShortAnswerOutput> {
  return getFeedbackOnShortAnswerFlow(input);
}

const getFeedbackOnShortAnswerPrompt = ai.definePrompt({
  name: 'getFeedbackOnShortAnswerPrompt',
  input: {schema: GetFeedbackOnShortAnswerInputSchema},
  output: {schema: GetFeedbackOnShortAnswerOutputSchema},
  prompt: `As an expert educator, evaluate the student's answer to the following short answer question.

**Question:**
{{question}}

**Ideal Answer:**
{{idealAnswer}}

**Student's Answer:**
{{userAnswer}}

Please evaluate the student's answer. Determine if it is 'Correct', 'Partially Correct', or 'Incorrect'. Provide a brief, constructive explanation for your evaluation, highlighting strengths and areas for improvement. Respond ONLY with a valid JSON object that adheres to the provided schema.`,
});

const getFeedbackOnShortAnswerFlow = ai.defineFlow(
  {
    name: 'getFeedbackOnShortAnswerFlow',
    inputSchema: GetFeedbackOnShortAnswerInputSchema,
    outputSchema: GetFeedbackOnShortAnswerOutputSchema,
  },
  async input => {
    const {output} = await getFeedbackOnShortAnswerPrompt(input);
    return output!;
  }
);
