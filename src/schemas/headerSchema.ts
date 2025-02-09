import { z } from 'zod'

const basicAuthRegex = /^Basic [A-Za-z0-9+/=]+$/

export const headerSchema = z.object({
  authorization: z
    .string({
      message: 'Authentication required',
      required_error: 'The authentication field is mandatory',
      invalid_type_error: 'The authentication field must be a string',
      description: 'Authentication token in Basic <token> format',
    })
    .refine((val) => basicAuthRegex.test(val), {
      message: 'Invalid authentication format, expected format: Basic <token>',
    }),
})
