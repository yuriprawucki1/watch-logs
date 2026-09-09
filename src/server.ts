import { log } from '@/utils/console'
import express, { type ErrorRequestHandler } from 'express'
import router from './routes'

export const app = express()
app.use(express.json({ limit: '100kb' }))
app.use(router)

const requestErrorHandler: ErrorRequestHandler = (
  _error,
  _request,
  response,
  _next
) => {
  response.status(400).json({
    errors: {
      message: 'Invalid request',
    },
  })
}

app.use(requestErrorHandler)

export const startServer = async (port: string): Promise<void> => {
  try {
    app.listen(port, () => {
      log('INFO', `Server is running on port ${port}`)
    })
  } catch (error) {
    log('ERROR', `Server failed to start ${error.message}`)
  }
}
