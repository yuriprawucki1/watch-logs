import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export const querySchema = z
  .object({
    from: z
      .string()
      .refine((val) => dateRegex.test(val), {
        message:
          'Invalid date format, expected format: YYYY-MM-DDTHH:mm:ss.sssZ',
      })
      .optional(),
    to: z
      .string()
      .refine((val) => dateRegex.test(val), {
        message:
          'Invalid date format, expected format: YYYY-MM-DDTHH:mm:ss.sssZ',
      })
      .optional(),
    range: z.string().min(1, { message: 'Cannot be empty' }).optional(),
  })
  .catchall(z.string().min(1, { message: 'Cannot be empty' }))
