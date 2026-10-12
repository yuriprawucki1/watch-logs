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

export const startServer = (port: string): void => {
  try {
    app.listen(port, () => {
      log('INFO', `Server is running on port ${port}`)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    log('ERROR', `Server failed to start ${message}`)
  }
}
