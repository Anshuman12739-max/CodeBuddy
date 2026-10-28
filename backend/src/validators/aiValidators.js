import { z } from 'zod';

const SUPPORTED_LANGUAGES = ['python', 'c', 'cpp', 'javascript'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const explainCodeSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` })
  }),
  code: z.string().trim()
    .min(1, 'Source code cannot be empty.')
    .max(12000, 'Source code exceeds maximum length of 12,000 characters.')
});

export const debugCodeSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` })
  }),
  code: z.string().trim()
    .min(1, 'Source code cannot be empty.')
    .max(12000, 'Source code exceeds maximum length of 12,000 characters.'),
  errorMessage: z.string().max(4000, 'Error message is too long.').optional().default(''),
  expectedBehavior: z.string().max(2000, 'Expected behavior is too long.').optional().default('')
});

export const practiceGenerateSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` })
  }),
  topic: z.string().trim().min(2, 'Topic name is required.').max(64, 'Topic name too long.'),
  difficulty: z.enum(DIFFICULTIES, {
    errorMap: () => ({ message: `Difficulty must be one of: ${DIFFICULTIES.join(', ')}` })
  })
});

export const hintRequestSchema = z.object({
  problemId: z.string().uuid().optional(),
  level: z.number().int().min(1).max(4, 'Progressive hints only support levels 1 through 4. For full solution use /api/ai/solution.'),
  problemContext: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    language: z.string().optional().default('python')
  }),
  studentCode: z.string().max(12000).optional().default('')
});

export const solutionRequestSchema = z.object({
  problemId: z.string().uuid().optional(),
  problemContext: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    language: z.string().optional().default('python')
  })
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty.').max(4000, 'Message is too long.'),
  language: z.enum(SUPPORTED_LANGUAGES).optional().default('python'),
  conversationId: z.string().uuid().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).max(20, 'History cannot exceed 20 turns.').optional().default([])
});
