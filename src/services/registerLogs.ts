import { env } from '@/constants/env'
import { buildLogEntry } from '@/services/buildLogEntry'
import type { BaseLog } from '@/types/BaseLog'
import { GraylogError } from '@/utils/GraylogError'
import axios from 'axios'

const graylogHost = env.GRAYLOG_HOST

export const register = async (
  data: BaseLog,
  endpoint: string
): Promise<void> => {
  const logEntry = buildLogEntry(data)
  const graylogUrl = `http://${graylogHost}:${endpoint}/gelf`
  try {
    await axios.post(graylogUrl, logEntry, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxBodyLength: 1024 * 1024,
      maxContentLength: 64 * 1024,
      maxRedirects: 0,
      timeout: 10_000,
    })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new GraylogError(error.response.status, 'Graylog request failed')
    }
    throw new GraylogError(500, 'Internal Server Error')
  }
}
