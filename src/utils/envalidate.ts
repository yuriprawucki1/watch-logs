import 'dotenv/config'
import type { ZodSchema } from 'zod'

/**
 * Validates the current environment variables against a schema and returns them typed.
 * If the validation fails, the missing or invalid variables are logged and the process exits.
 *
 * @param schema - The schema to validate the environment variables against.
 * @returns The environment variables typed.
 */
export const envalidate = <T>(schema: ZodSchema): T => {
  const { env } = process
  const { success, error, data } = schema.safeParse(env)
  if (!success) {
    // biome-ignore lint/suspicious/noConsole: Allow console.error for logging errors to the user
    console.error('The following environment variables are missing or invalid:')
    for (const element of error.issues) {
      // biome-ignore lint/suspicious/noConsole: Allow console.error for logging errors to the user
      console.error(`${element.path.join('.')}: ${element.message}`)
    }
    // biome-ignore lint/suspicious/noConsole: Allow console.error for logging errors to the user
    console.error('Please check your .env file and try again.')
    process.exit(1)
  }
  return data as T
}
