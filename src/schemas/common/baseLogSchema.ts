import { z } from 'zod'
import { aditionalFieldsSchema } from './aditionalFieldsSchema'
import { fullMessageSchema } from './fullMessageSchema'
import { hostSchema } from './hostSchema'
import { levelSchema } from './levelSchema'
import { shortMessageSchema } from './shortMessageSchema'

export const baseLogSchema = z
  .object({
    host: hostSchema,
    short_message: shortMessageSchema,
    level: levelSchema,
    full_message: fullMessageSchema,
    additional_fields: aditionalFieldsSchema,
  })
  .strict()
