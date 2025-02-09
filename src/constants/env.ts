import { envalidate } from '@/utils/envalidate'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3000'),
  GRAYLOG_HOST: z.string(),
})

export const env = envalidate<z.infer<typeof envSchema>>(envSchema)
