import { envalidate } from '@/utils/envalidate'
import { isValidHostname } from '@/utils/hostname'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z
    .string()
    .regex(/^\d{1,5}$/, 'PORT must be a numeric port.')
    .refine(
      (value) => Number(value) >= 1 && Number(value) <= 65_535,
      'PORT must be between 1 and 65535.'
    )
    .default('3000'),
  GRAYLOG_HOST: z
    .string()
    .refine(isValidHostname, 'GRAYLOG_HOST must be a hostname or FQDN.'),
})

export const env = envalidate<z.infer<typeof envSchema>>(envSchema)
