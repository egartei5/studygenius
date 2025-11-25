// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent for evaluating student answers and providing feedback.
 *
 * - getAnswerFeedback - A function that handles the evaluation process.
 * - GetAnswerFeedbackInput - The input type for the getAnswerFeedback function.
 * - GetAnswerFeedbackOutput - The return type for the getAnswerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAnswerFeedbackInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  idealAnswer: z.string().describe('The ideal answer to the question.'),
  userAnswer: z.string().describe('The student\u2019s answer to the question.'),
});
export type GetAnswerFeedbackInput = z.infer<typeof GetAnswerFeedbackInputSchema>;

const GetAnswerFeedbackOutputSchema = z.object({
  verdict: z.enum(['Correct', 'Partially Correct', 'Incorrect']).describe('The evaluation verdict.'),
  explanation: z.string().describe('The explanation for the verdict.'),
});
export type GetAnswerFeedbackOutput = z.infer<typeof GetAnswerFeedbackOutputSchema>;

export async function getAnswerFeedback(input: GetAnswerFeedbackInput): Promise<GetAnswerFeedbackOutput> {
  return getAnswerFeedbackFlow(input);
}

const getAnswerFeedbackPrompt = ai.definePrompt({
  name: 'getAnswerFeedbackPrompt',
  input: {schema: GetAnswerFeedbackInputSchema},
  output: {schema: GetAnswerFeedbackOutputSchema},
  prompt: `As an expert educator, evaluate the student's answer to the following question.

**Question:**
{{question}}

**Ideal Answer:**
{{idealAnswer}}

**Student's Answer:**
{{userAnswer}}

Please evaluate the student's answer. Determine if it is 'Correct', 'Partially Correct', or 'Incorrect'. Provide a brief, constructive explanation for your evaluation, highlighting strengths and areas for improvement. Respond ONLY with a valid JSON object that adheres to the provided schema.`,
});

const getAnswerFeedbackFlow = ai.defineFlow(
  {
    name: 'getAnswerFeedbackFlow',
    inputSchema: GetAnswerFeedbackInputSchema,
    outputSchema: GetAnswerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await getAnswerFeedbackPrompt(input);
    return output!;
  }
);
