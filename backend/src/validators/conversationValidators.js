import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(100).optional().default('New Tutoring Chat'),
  language: z.enum(['python', 'c', 'cpp', 'javascript']).optional().default('python')
});

export const updateConversationSchema = z.object({
  title: z.string().trim().min(1).max(100)
});

export const addMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(10000)
});
