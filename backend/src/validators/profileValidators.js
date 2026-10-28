import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  preferredLanguage: z.enum(['python', 'c', 'cpp', 'javascript']).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});
