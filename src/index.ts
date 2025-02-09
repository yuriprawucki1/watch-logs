import { env } from '@/constants/env'
import { startServer } from '@/server'

const port = env.PORT

startServer(port)
