import { HttpException, HttpStatus } from "@nestjs/common";

export class BookingValidationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Booking Validation Error",
        message,
        errorCode: "BOOKING_VALIDATION_ERROR",
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PaymentProcessingException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Payment Processing Error",
        message,
        errorCode: "PAYMENT_PROCESSING_ERROR",
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier: string | number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: "Resource Not Found",
        message: `${resource} with identifier ${identifier} was not found.`,
        errorCode: "RESOURCE_NOT_FOUND",
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AuthenticationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        error: "Authentication Error",
        message,
        errorCode: "AUTHENTICATION_ERROR",
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
