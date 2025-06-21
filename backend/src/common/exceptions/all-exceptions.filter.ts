import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as string | { message?: string };
      message =
        typeof exceptionResponse === "string" ? exceptionResponse : (exceptionResponse.message ?? "Unknown error");
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorWithMessage = exception as { error?: string; message?: string };
      message = errorWithMessage.error ?? errorWithMessage.message ?? "Internal server error";
    }

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
