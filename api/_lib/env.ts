const requiredAuthVariables = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_OAUTH_REDIRECT_URI',
  'SESSION_SECRET',
] as const

export function getEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    return null
  }

  return value
}

export function isOAuthConfigured() {
  return requiredAuthVariables.every((name) => Boolean(getEnv(name)))
}

export function getMissingOAuthVariables() {
  return requiredAuthVariables.filter((name) => !getEnv(name))
}
