import { z } from 'zod';

export const saveProblemSchema = z.object({
  language: z.enum(['python', 'c', 'cpp', 'javascript']),
  topic: z.string().min(2).max(64),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  title: z.string().min(2).max(200),
  description: z.string().min(5),
  inputDescription: z.string().optional().default(''),
  outputDescription: z.string().optional().default(''),
  constraints: z.string().optional().default(''),
  sampleInput: z.string().optional().default(''),
  sampleOutput: z.string().optional().default(''),
  conceptPracticed: z.string().optional().default('')
});

export const attemptSchema = z.object({
  submittedCode: z.string().max(20000).optional().default(''),
  hintsUsed: z.number().int().min(0).max(5).optional().default(0),
  completed: z.boolean().optional().default(false)
});
