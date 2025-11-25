 'use server';

/**
 * @fileOverview Generates a set of diverse study aids (quizzes, flashcards, diagrams) from a given topic.
 *
 * - generateStudyAidsFromTopic - A function that handles the generation of study aids.
 * - GenerateStudyAidsFromTopicInput - The input type for the generateStudyAidsFromTopic function.
 * - GenerateStudyAidsFromTopicOutput - The return type for the generateStudyAidsFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyAidsFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic to generate study aids for.'),
  resourceTypes: z.object({
    mcqs: z.boolean().describe('Whether to generate multiple-choice questions.'),
    shortAnswer: z.boolean().describe('Whether to generate short answer questions.'),
    flashcards: z.boolean().describe('Whether to generate flashcards.'),
    matching: z.boolean().describe('Whether to generate matching pairs.'),
    diagram: z.boolean().describe('Whether to generate diagram questions.'),
  }).describe('The types of study resources to generate.'),
  count: z.number().describe('The number of items to generate for each resource type.'),
  difficulty: z.enum(['Introductory', 'Intermediate', 'Advanced']).describe('The difficulty level of the study aids.'),
  fileContent: z.string().nullable().describe('Additional context from user notes.'),
  imageContent: z.string().nullable().describe('Image data URI for diagram generation.'),
});
export type GenerateStudyAidsFromTopicInput = z.infer<typeof GenerateStudyAidsFromTopicInputSchema>;

const GenerateStudyAidsFromTopicOutputSchema = z.object({
  mcqs: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
    explanation: z.string(),
  })).optional(),
  shortAnswerQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  flashcards: z.array(z.object({
    front: z.string(),
    back: z.string(),
  })).optional(),
  matchingPairs: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })).optional(),
  diagramQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    explanation: z.string(),
  })).optional(),
});
export type GenerateStudyAidsFromTopicOutput = z.infer<typeof GenerateStudyAidsFromTopicOutputSchema>;

export async function generateStudyAidsFromTopic(input: GenerateStudyAidsFromTopicInput): Promise<GenerateStudyAidsFromTopicOutput> {
  return generateStudyAidsFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyAidsFromTopicPrompt',
  input: {schema: GenerateStudyAidsFromTopicInputSchema},
  output: {schema: GenerateStudyAidsFromTopicOutputSchema},
  prompt: `You are an AI study assistant for high school and college students and teachers. Your purpose is to convert any topic or user-provided materials into engaging study resources.

**Topic:** {{{topic}}}

**Difficulty Level:** {{{difficulty}}}

**Requested Resources:**
{{#if resourceTypes.mcqs}}Multiple Choice Questions, {{/if}}
{{#if resourceTypes.shortAnswer}}Short Answer Questions, {{/if}}
{{#if resourceTypes.flashcards}}Flashcards, {{/if}}
{{#if resourceTypes.matching}}Matching Pairs, {{/if}}
{{#if resourceTypes.diagram}}Diagram Questions, {{/if}}

**Number of items per resource type:** {{{count}}}

**Additional Context from user\'s notes:**
{{#if fileContent}}{{{fileContent}}}{{else}}None provided.{{/if}}

{{#if imageContent}}
You have provided a diagram.
{{/if}}

Please generate a comprehensive study set based on these requirements. Ensure the content is accurate and suitable for the specified difficulty level (high school or college). The output MUST be a valid JSON object that adheres to the provided schema.

For Multiple-Choice Questions (MCQs), create challenging but fair questions with four distinct options and a clear explanation.
For Flashcards, keep them concise and focused on a single concept.
For Matching Pairs, ensure a clear one-to-one relationship between terms and definitions.
For Diagram Questions, formulate questions that test identification and function related to the provided image.
`,
});

const generateStudyAidsFromTopicFlow = ai.defineFlow(
  {
    name: 'generateStudyAidsFromTopicFlow',
    inputSchema: GenerateStudyAidsFromTopicInputSchema,
    outputSchema: GenerateStudyAidsFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
