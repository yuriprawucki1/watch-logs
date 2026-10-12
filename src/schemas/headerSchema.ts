import { z } from 'zod'

const basicAuthRegex = /^Basic [A-Za-z0-9+/=]+$/

export const headerSchema = z.object({
  authorization: z
    .string({
      error: (issue: { input?: unknown }) =>
        issue.input === undefined
          ? 'The authentication field is mandatory'
          : 'The authentication field must be a string',
    })
    .describe('Authentication token in Basic <token> format')
    .refine((val) => basicAuthRegex.test(val), {
      error: 'Invalid authentication format, expected format: Basic <token>',
    }),
})
