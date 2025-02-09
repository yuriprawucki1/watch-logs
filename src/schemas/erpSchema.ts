import { baseLogSchema } from '@/schemas/common/baseLogSchema'
import { codErpSchema } from '@/schemas/common/codErpSchema'
import { traceIdSchema } from '@/schemas/common/traceIdSchema'

export const erpSchema = baseLogSchema.extend({
  trace_id: traceIdSchema,
  cod_erp: codErpSchema,
})
