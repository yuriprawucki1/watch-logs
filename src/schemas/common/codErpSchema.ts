import { z } from 'zod'

export const codErpSchema = z
  .string({
    error: (issue: { input?: unknown }) =>
      issue.input === undefined
        ? 'The ERP code is required.'
        : 'The ERP code must be a string.',
  })
  .describe('The ERP code.')
  .max(10, {
    error: 'The ERP code must have a maximum of 10 characters.',
  })
