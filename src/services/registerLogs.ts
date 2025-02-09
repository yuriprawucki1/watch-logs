import { env } from '@/constants/env'
import type { BaseLog } from '@/types/BaseLog'
import { GraylogError } from '@/utils/GraylogError'
import axios from 'axios'

const graylogHost = env.GRAYLOG_HOST

export const register = async (
  data: BaseLog,
  endpoint: string
): Promise<void> => {
  const {
    host,
    short_message,
    full_message,
    level,
    additional_fields,
    ...rest
  } = data
  const logEntry: BaseLog = {
    host,
    short_message,
    full_message,
    level,
    ...rest,
    ...additional_fields,
  }
  const graylogUrl = `http://${graylogHost}:${endpoint}/gelf`
  try {
    await axios.post(graylogUrl, logEntry, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new GraylogError(error.response.status, error.response.data)
    }
    throw new GraylogError(500, 'Internal Server Error')
  }
}
