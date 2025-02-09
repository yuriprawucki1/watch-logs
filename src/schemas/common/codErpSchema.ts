import { z } from 'zod'

export const codErpSchema = z
  .string({
    message: 'The ERP code must be a string.',
    required_error: 'The ERP code is required.',
    invalid_type_error: 'The ERP code must be a string.',
    description: 'The ERP code.',
  })
  .max(10, {
    message: 'The ERP code must have a maximum of 10 characters.',
  })
