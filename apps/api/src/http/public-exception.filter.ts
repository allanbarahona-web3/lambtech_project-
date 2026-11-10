import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

type HttpResponse = {
  status(statusCode: number): { json(body: { message: string; statusCode: number }): void };
};

function getSafeStatusCode(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  const candidate =
    exception && typeof exception === "object"
      ? (exception as { status?: unknown; statusCode?: unknown })
      : undefined;
  const status = candidate?.status ?? candidate?.statusCode;
  return typeof status === "number" && Number.isInteger(status) && status >= 400 && status <= 599
    ? status
    : HttpStatus.INTERNAL_SERVER_ERROR;
}

function getPublicMessage(statusCode: number): string {
  if (statusCode === HttpStatus.PAYLOAD_TOO_LARGE) {
    return "Request entity too large.";
  }

  if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
    return "Too many requests. Please try again later.";
  }

  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return "Unable to process this request.";
  }

  return "Invalid request.";
}

@Catch()
export class PublicExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PublicExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const statusCode = getSafeStatusCode(exception);
    if (statusCode === HttpStatus.PAYLOAD_TOO_LARGE) {
      this.logger.warn(
        JSON.stringify({ category: "API_REQUEST_BODY_TOO_LARGE", statusCode }),
      );
    } else if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        JSON.stringify({ category: "API_UNEXPECTED_ERROR", statusCode }),
      );
    }

    const response = host.switchToHttp().getResponse<HttpResponse>();
    response.status(statusCode).json({
      message: getPublicMessage(statusCode),
      statusCode,
    });
  }
}
