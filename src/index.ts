import { env } from '@/constants/env'
import { startServer } from '@/server'

const port: string = env.PORT

startServer(port)
