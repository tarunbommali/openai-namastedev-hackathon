export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: error.message,
        details: error.details
      }
    };
  }
  console.error(error);
  return {
    status: 500,
    body: { error: "Unable to complete the hiring workflow. Please try again." }
  };
}
