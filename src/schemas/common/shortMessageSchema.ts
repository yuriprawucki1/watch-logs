import { z } from 'zod'

export const shortMessageSchema = z
  .string({
    error: (issue: { input?: unknown }) =>
      issue.input === undefined
        ? 'The short message is required.'
        : 'The short message must be a string.',
  })
  .describe('Short and objective message.')
  .max(94, {
    error: 'The short message must have a maximum of 94 characters.',
  })
