import type { z } from 'zod'
import type { baseLogSchema } from '@/schemas/common/baseLogSchema'

export type BaseLog = z.infer<typeof baseLogSchema>
