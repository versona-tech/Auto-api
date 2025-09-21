'use client';
    
import { useEffect, useActionState, useRef } from 'react';
import { generateDocsAction, type ActionState } from '@/app/actions';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Code, Download, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState: ActionState = {
  correctedCode: undefined,
  postmanCollection: undefined,
};

const exampleCode = `/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A single user.
 *       '404':
 *         description: User not found.
 */
function getUserById(req, res) {
  // ...
}`;

export default function HomePage() {
  const [state, formAction, isPending] = useActionState(generateDocsAction, initialState);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
    if ((state.correctedCode || state.postmanCollection) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state, toast]);

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasResults = state.correctedCode || state.postmanCollection;

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto grid w-full max-w-4xl gap-12">
          
          <div className="text-center mt-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">AutoAPI</h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              Paste your code with JSDoc comments, and we'll automatically fix it and generate a Postman collection.
            </p>
          </div>

          <form
            action={formAction}
            className="grid gap-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Code Input</CardTitle>
                <CardDescription>
                  Enter your JavaScript/TypeScript code with API documentation comments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Textarea
                  name="code"
                  placeholder="Enter your code here..."
                  className="min-h-[400px] font-code text-sm resize-y bg-white dark:bg-slate-800"
                  defaultValue={exampleCode}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:self-end" size="lg">
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </CardContent>
            </Card>
          </form>

          {isPending && (
            <div className="grid gap-8">
               <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Generating Output</CardTitle>
                  <CardDescription>
                    Please wait while the AI is processing your request...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                   <div className="mt-4 rounded-md border bg-slate-50 dark:bg-slate-800 h-[450px] p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/6" />
                      <Skeleton className="h-4 w-full" />
                   </div>
                </CardContent>
              </Card>
            </div>
          )}

          {hasResults && !isPending && (
            <div ref={resultsRef} className="grid gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Generated Output</CardTitle>
                  <CardDescription>
                    Here is the corrected code and the downloadable Postman collection.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="corrected-code" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="corrected-code">
                        <Code className="mr-2 h-4 w-4"/>
                        Corrected Code
                      </TabsTrigger>
                      <TabsTrigger value="postman">
                        <Download className="mr-2 h-4 w-4"/>
                        Postman Collection
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="corrected-code">
                      <div className="mt-4 rounded-md border bg-slate-900 dark:bg-slate-800 h-[450px] overflow-auto">
                        <pre className="p-4">
                          <code className="font-code text-sm text-slate-50 whitespace-pre-wrap">
                            {state.correctedCode}
                          </code>
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="postman">
                      <div className="relative">
                        <div className="mt-4 rounded-md border bg-slate-900 dark:bg-slate-800 h-[450px] overflow-auto">
                          <pre className="p-4">
                            <code className="font-code text-sm text-slate-50 whitespace-pre-wrap">
                              {state.postmanCollection}
                            </code>
                          </pre>
                        </div>
                        {state.postmanCollection && (
                          <div className="absolute bottom-4 right-4">
                              <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleDownload(state.postmanCollection!, 'postman_collection.json')}
                              >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download JSON
                              </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
