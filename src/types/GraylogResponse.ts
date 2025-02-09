export type GraylogResponse = {
  messages: GraylogMessage[]
}

export type GraylogMessage = {
  message: Record<string, unknown>
}
