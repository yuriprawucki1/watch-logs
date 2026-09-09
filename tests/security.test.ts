import assert from 'node:assert/strict'
import test from 'node:test'
import { parseBasicAuth } from '@/utils/basicAuth'
import { buildGraylogQuery } from '@/utils/graylogQuery'
import { isValidHostname } from '@/utils/hostname'

test('parses Basic Auth passwords containing a colon', () => {
  const token = Buffer.from('graylog-user:secret:with:colons').toString(
    'base64'
  )

  assert.deepEqual(parseBasicAuth(`Basic ${token}`), {
    username: 'graylog-user',
    password: 'secret:with:colons',
  })
})

test('rejects malformed Basic Auth credentials', () => {
  assert.equal(parseBasicAuth('Basic not-base64'), null)
  assert.equal(
    parseBasicAuth(
      `Basic ${Buffer.from('missing-separator').toString('base64')}`
    ),
    null
  )
})

test('quotes query values before interpolating them into Graylog syntax', () => {
  assert.equal(
    buildGraylogQuery('source:watch-logs', {
      message: 'hello" OR source:*',
    }),
    'source:watch-logs AND message:"hello\\" OR source:*"'
  )
})

test('rejects query field names that can alter the Graylog query', () => {
  assert.throws(
    () => buildGraylogQuery('source:watch-logs', { 'message OR *:*': 'value' }),
    { message: 'Invalid query filter' }
  )
})

test('accepts hostnames but rejects URL syntax in GRAYLOG_HOST', () => {
  assert.equal(isValidHostname('graylog.example.com'), true)
  assert.equal(isValidHostname('http://graylog.example.com'), false)
  assert.equal(isValidHostname('graylog.example.com:9000'), false)
})
