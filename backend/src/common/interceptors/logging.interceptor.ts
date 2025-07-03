import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === "http") {
      return this.logHttpCall(context, next);
    }
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request as {
      method: string;
      url: string;
      body: unknown;
      query: unknown;
      params: unknown;
    };
    const userAgent = request.get("User-Agent") ?? "";
    const ip = request.ip ?? request.socket.remoteAddress;

    const now = Date.now();

    this.logger.log(
      `📥 ${method} ${url} - ${userAgent} ${ip} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`,
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown): void => {
          const { statusCode } = response;
          const contentLength = response.get("content-length") ?? "0";
          const elapsed = Date.now() - now;

          this.logger.log(`📤 ${method} ${url} ${statusCode} ${contentLength}b - ${elapsed}ms`);

          // Log response data for non-production environments (be careful with sensitive data)
          if (process.env.NODE_ENV !== "production") {
            this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
          }
        },
        error: (error: Error): void => {
          const { statusCode } = response;
          const elapsed = Date.now() - now;

          this.logger.error(`❌ ${method} ${url} ${statusCode} - ${elapsed}ms - Error: ${error.message}`, error.stack);
        },
      }),
    );
  }
}
