'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FixApiDocsInputSchema = z.object({
  code: z
    .string()
    .describe('The JavaScript/TypeScript code with API documentation comments.'),
});
export type FixApiDocsInput = z.infer<typeof FixApiDocsInputSchema>;

const FixApiDocsOutputSchema = z.object({
  correctedCode: z
    .string()
    .describe('The corrected JavaScript/TypeScript code with valid API documentation.'),
});
export type FixApiDocsOutput = z.infer<typeof FixApiDocsOutputSchema>;

export async function fixApiDocs(input: FixApiDocsInput): Promise<FixApiDocsOutput> {
  return fixApiDocsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fixApiDocsPrompt',
  input: {schema: FixApiDocsInputSchema},
  output: {schema: FixApiDocsOutputSchema},
  prompt: `You are an expert API documentation specialist. Your task is to analyze the provided JavaScript/TypeScript code and correct only the JSDoc/Swagger comments to ensure they are valid and complete for generating API documentation.

  - Focus exclusively on correcting the content within \`/** ... */\` blocks that contain the \`@swagger\` tag.
  - Do NOT modify any other part of the code, including function signatures, business logic, or other comments.
  - Ensure the corrected documentation adheres to Swagger/OpenAPI standards.
  - The output should be the full, original code with only the specified comments corrected.

  Corrected Code should be in the same language as the input code.

  Here is the code:
  \`\`\`{{{code}}}
  \`\`\`
  `,
});

const fixApiDocsFlow = ai.defineFlow(
  {
    name: 'fixApiDocsFlow',
    inputSchema: FixApiDocsInputSchema,
    outputSchema: FixApiDocsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.correctedCode) {
      throw new Error(
        'The AI model failed to return a valid response. This might be due to the input code complexity or a temporary service issue. Please try again with a different code snippet.'
      );
    }
    return output;
  }
);
