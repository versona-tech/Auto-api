'use server';

import { fixApiDocs } from '@/ai/flows/fix-api-docs';
import { generatePostmanCollection } from '@/lib/postman';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(10, { message: 'Code must be at least 10 characters long.' }),
});

export interface ActionState {
  error?: string;
  correctedCode?: string;
  postmanCollection?: string;
}

export async function generateDocsAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validatedFields = schema.safeParse({
    code: formData.get('code'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: validatedFields.error.flatten().fieldErrors.code?.[0],
    };
  }

  try {
    const result = await fixApiDocs({ code: validatedFields.data.code });

    if (!result || !result.correctedCode) {
        return { 
          ...prevState,
          error: 'Failed to correct the code. The AI service returned an empty response. Please check your input and try again.' 
        };
    }

    const { correctedCode } = result;
    const postmanCollection = generatePostmanCollection(correctedCode);

    return {
      correctedCode: correctedCode,
      postmanCollection: JSON.stringify(postmanCollection, null, 2),
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { 
      ...prevState,
      error: `An unexpected error occurred: ${errorMessage}`
    };
  }
}
