import type { Server } from 'node:http'
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import { log } from '@/utils/console'
import router from './routes'

export const app = express()
app.use(express.json({ limit: '100kb' }))
app.use(router)

const requestErrorHandler: ErrorRequestHandler = (
  _error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  response.status(400).json({
    errors: {
      message: 'Invalid request',
    },
  })
}

app.use(requestErrorHandler)

const logStartupError = (error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  log('ERROR', `Server failed to start ${message}`)
  process.exitCode = 1
}

export const startServer = (port: string): Server | undefined => {
  try {
    return app.listen(port, (error?: Error) => {
      if (error) {
        logStartupError(error)
        return
      }

      log('INFO', `Server is running on port ${port}`)
    })
  } catch (error) {
    logStartupError(error)
    return undefined
  }
}
