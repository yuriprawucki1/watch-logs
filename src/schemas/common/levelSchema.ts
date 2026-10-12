import { z } from 'zod'

export const levelSchema = z
  .number({
    error: (issue: { input?: unknown }) =>
      issue.input === undefined
        ? 'Level is required.'
        : 'Level must be a number.',
  })
  .describe('Message level.')
  .int('Level must be an integer.')
  .min(0, {
    error: 'Level must be at least 0.',
  })
  .max(7, {
    error: 'Level must be at most 7.',
  })
