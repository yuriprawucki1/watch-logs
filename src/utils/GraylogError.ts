export class GraylogError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message)
  }
}
