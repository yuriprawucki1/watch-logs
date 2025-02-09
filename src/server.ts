import { log } from '@/utils/console'
import express from 'express'
import router from './routes'

const app = express()
app.use(express.json())
app.use(router)

export const startServer = async (port: string): Promise<void> => {
  try {
    app.listen(port, () => {
      log('INFO', `Server is running on port ${port}`)
    })
  } catch (error) {
    log('ERROR', `Server failed to start ${error.message}`)
  }
}
