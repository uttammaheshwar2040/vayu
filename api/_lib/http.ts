export type ApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
  url?: string
}

export type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string | string[]) => void
  redirect: (statusCode: number, location: string) => void
}

export function sendJson(res: ApiResponse, statusCode: number, payload: unknown) {
  res.status(statusCode).json(payload)
}

export function readRange(query: ApiRequest['query']) {
  const rawValue = query?.range
  if (Array.isArray(rawValue)) {
    return rawValue[0]
  }

  return rawValue
}
