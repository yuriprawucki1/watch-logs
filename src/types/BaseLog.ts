import type { baseLogSchema } from '@/schemas/common/baseLogSchema'
import type { z } from 'zod'

export type BaseLog = z.infer<typeof baseLogSchema>
