import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as string | { message?: string; error?: string };
    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse.message ?? exceptionResponse.error ?? "HTTP Exception");

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: typeof exceptionResponse === "string" ? exceptionResponse : (exceptionResponse.error ?? exception.name),
      message,
    };

    response.status(status).json(errorResponse);
  }
}
