import { logTypes } from '@/constants/logType'
import { headerSchema } from '@/schemas/headerSchema'
import { paramsSchema } from '@/schemas/paramsSchema'
import { querySchema } from '@/schemas/querySchema'
import { fetchLogs } from '@/services/fetchLogs'
import { register } from '@/services/registerLogs'
import type { BaseLog } from '@/types/BaseLog'
import type { LogType } from '@/types/LogType'
import { getLogTypeConfig } from '@/utils/logTypeConfig'
import { type Request, type Response, Router } from 'express'
import { ZodError } from 'zod'

const router = Router()
const params = logTypes as [string, ...string[]]

function handleZodError(error: ZodError, res: Response): void {
  const errors = error.errors.reduce((acc, err) => {
    if (err.code === 'unrecognized_keys') {
      return Object.assign(acc, {
        campos_inesperados: err.keys.join(', '),
      })
    }
    return Object.assign(acc, { [err.path.join('.')]: err.message })
  }, {})
  res.status(400).json({
    errors,
  })
}

router.get('/', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'You need to pass the path /logs and one of the parameters below',
    params,
  })
})

router.post('/', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'You need to pass the path /logs and one of the parameters below',
    params,
  })
})

router.get('/logs', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'You must pass one of the parameters below',
    params,
  })
})

router.post('/logs', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'You must pass one of the parameters below',
    params,
  })
})

router.post('/logs/:logType', async (req: Request, res: Response) => {
  try {
    const validateParams = paramsSchema.parse({ logType: req.params.logType })
    const { validateData, endpoint } = getLogTypeConfig(
      validateParams.logType as LogType,
      req.body
    )
    await register(validateData as BaseLog, endpoint as string)
    res.sendStatus(201)
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError(error, res)
      return
    }
    res.status(error.statusCode || 500).json({
      errors: {
        message: error.message,
      },
    })
  }
})

router.get('/logs/:logType', async (req: Request, res: Response) => {
  try {
    const validateParams = paramsSchema.parse({ logType: req.params.logType })
    const { input } = getLogTypeConfig(
      validateParams.logType as LogType,
      {},
      true
    )
    const { from, to, range, ...rest } = querySchema.parse(req.query) as Record<
      string,
      string
    >
    const { authorization } = headerSchema.parse(req.headers)
    const [username, password] = Buffer.from(
      authorization.split(' ')[1],
      'base64'
    )
      .toString('utf-8')
      .split(':')
    const auth = { username, password }
    const logs = await fetchLogs({
      auth,
      query: input as string,
      fields: {
        ...rest,
      } as { [key: string]: string } | undefined,
      from: from as string | undefined,
      to: to as string | undefined,
      range: range as string | undefined,
    })
    res.status(200).json(logs)
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError(error, res)
      return
    }
    res.status(error.statusCode || 500).json({
      errors: {
        message: error.message,
      },
    })
  }
})

export default router
