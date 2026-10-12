import { z } from 'zod'

export const hostSchema = z
  .string({
    error: (issue: { input?: unknown }) =>
      issue.input === undefined
        ? 'The host is required.'
        : 'The host must be a string.',
  })
  .describe('The host where the application is located.')
  .max(50, {
    error: 'The host must be at most 50 characters long.',
  })
