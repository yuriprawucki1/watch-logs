import { env } from '@/constants/env'
import type { GraylogMessage, GraylogResponse } from '@/types/GraylogResponse'
import { GraylogError } from '@/utils/GraylogError'
import axios from 'axios'

const grayLogHost = env.GRAYLOG_HOST
const graylogResponseIgnoreFields = [
  'highlight_ranges',
  'gl2_accounted_message_size',
  'gl2_remote_ip',
  'gl2_remote_port',
  'streams',
  'gl2_message_id',
  'gl2_source_input',
  'gl2_source_node',
  '_id',
  'index',
  'decoration_stats',
]

export const fetchLogs = async (data: {
  auth: { username: string; password: string }
  query: string
  from?: string
  to?: string
  range?: string
  fields?: { [key: string]: string }
}): Promise<Record<string, unknown>[]> => {
  const { auth, query, from, to, range, fields } = data
  let finalQuery = query
  if (fields) {
    for (const [field, fieldValue] of Object.entries(fields)) {
      finalQuery += ` AND ${field}:${fieldValue}`
    }
  }
  const params = new URLSearchParams({
    query: finalQuery,
    ...(from && { from }),
    ...(to && { to }),
    ...(from && to ? {} : { range: range || '0' }),
  }).toString()
  const GRAYLOG_API_URL = `http://${grayLogHost}:9000/api/search/universal/${
    from && to ? 'absolute' : 'relative'
  }?${params}`
  try {
    const response = await axios.get<GraylogResponse>(GRAYLOG_API_URL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    return response.data.messages.map(({ message }: GraylogMessage) => {
      const filteredMessage = Object.fromEntries(
        Object.entries(message).filter(
          ([key]) => !graylogResponseIgnoreFields.includes(key)
        )
      )
      return filteredMessage
    })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new GraylogError(error.response.status, error.response.statusText)
    }
    throw new GraylogError(500, 'Internal Server Error')
  }
}
