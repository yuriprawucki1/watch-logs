import { z } from 'zod'

export const fullMessageSchema = z
  .string({
    error: (issue: { input?: unknown }) =>
      issue.input === undefined
        ? 'Message is required.'
        : 'Message must be a string.',
  })
  .describe('Detailed message.')
  .max(10000, {
    error: 'Message must have a maximum of 10000 characters.',
  })
