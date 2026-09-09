export type BasicAuthCredentials = {
  username: string
  password: string
}

const basicAuthRegex = /^Basic ([A-Za-z0-9+/]+={0,2})$/

export function parseBasicAuth(
  authorization: string
): BasicAuthCredentials | null {
  const match = basicAuthRegex.exec(authorization)
  if (!match) {
    return null
  }

  const encodedCredentials = match[1]
  if (encodedCredentials.length % 4 !== 0) {
    return null
  }

  const decodedCredentials = Buffer.from(encodedCredentials, 'base64')
  if (decodedCredentials.toString('base64') !== encodedCredentials) {
    return null
  }

  const separatorIndex = decodedCredentials.indexOf(':'.charCodeAt(0))
  if (separatorIndex <= 0) {
    return null
  }

  return {
    username: decodedCredentials.subarray(0, separatorIndex).toString('utf8'),
    password: decodedCredentials.subarray(separatorIndex + 1).toString('utf8'),
  }
}
