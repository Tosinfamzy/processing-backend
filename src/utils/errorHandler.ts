import { APIGatewayProxyResult } from "aws-lambda";

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Logs the error and returns a standardized response.
 * @param error - The error object or message
 * @param defaultMessage
 * @returns APIGatewayProxyResult - The HTTP response
 */
export const handleError = (
  error: unknown,
  defaultMessage: string = "An unexpected error occurred."
): APIGatewayProxyResult => {
  const isAppError = (err: any): err is AppError =>
    typeof err === "object" && err !== null && "message" in err;

  const message = isAppError(error) ? error.message : defaultMessage;
  const statusCode =
    isAppError(error) && error.statusCode ? error.statusCode : 500;

  console.error("Error:", error);

  return {
    statusCode,
    body: JSON.stringify({
      error: message,
    }),
  };
};
