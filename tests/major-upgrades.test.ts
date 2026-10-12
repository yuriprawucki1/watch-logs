import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import type { z } from 'zod'
import { logTypes } from '@/constants/logType'
import { aditionalFieldsSchema } from '@/schemas/common/aditionalFieldsSchema'
import { hostSchema } from '@/schemas/common/hostSchema'
import { paramsSchema } from '@/schemas/paramsSchema'
import { querySchema } from '@/schemas/querySchema'

function firstIssueMessage(
  schema: z.ZodType,
  input: unknown
): string | undefined {
  const result = schema.safeParse(input)
  return result.success ? undefined : result.error.issues[0]?.message
}

test('Zod 4 preserves required and invalid-type validation messages', () => {
  assert.equal(
    firstIssueMessage(hostSchema, undefined),
    'The host is required.'
  )
  assert.equal(
    firstIssueMessage(hostSchema, null),
    'The host must be a string.'
  )
})

test('Zod 4 preserves log type and range validation behavior', () => {
  assert.equal(firstIssueMessage(paramsSchema, {}), 'Endpoint is required')
  assert.equal(
    firstIssueMessage(paramsSchema, { logType: 'invalid' }),
    `The endpoint must be one of the following: ${logTypes.join(', ')}`
  )
  assert.equal(firstIssueMessage(querySchema, { range: '' }), 'Cannot be empty')
  assert.deepEqual(querySchema.parse({ range: '5 minutes' }), {
    range: '5 minutes',
  })
})

test('Zod 4 record schema keeps accepting additional string fields', () => {
  assert.deepEqual(aditionalFieldsSchema.parse({ custom_field: 'value' }), {
    custom_field: 'value',
  })
})

test('Express 5 keeps the documented route catalog response', async () => {
  // biome-ignore lint/style/noProcessEnv: The route module requires a valid test hostname during initialization.
  process.env.GRAYLOG_HOST = 'graylog.example.com'
  const { app } = await import('../src/server.js')
  const server = app.listen(0)
  await once(server, 'listening')

  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const response = await fetch(`http://127.0.0.1:${address.port}/logs`)

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), {
      error: 'You must pass one of the parameters below',
      params: logTypes,
    })
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error?: Error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }
})
