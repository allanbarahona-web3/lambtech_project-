import { Logger, ValidationPipe } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";
import {
  type ApiConfiguration,
  getApiConfiguration,
} from "./config/api-configuration";
import { PublicExceptionFilter } from "./http/public-exception.filter";

export async function createApiApplication(
  configuration: ApiConfiguration,
) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(configuration));

  app.setGlobalPrefix("v1");
  app.set("trust proxy", configuration.trustProxy);
  const logger = new Logger("PublicRequest");
  app.use((request: { correlationId?: string; method?: string; originalUrl?: string }, response: { setHeader(name: string, value: string): void; statusCode?: number; on(event: "finish", listener: () => void): void }, next: () => void) => {
    const correlationId = randomUUID();
    const startedAt = Date.now();
    request.correlationId = correlationId;
    response.setHeader("X-Request-Id", correlationId);
    response.on("finish", () => logger.log(JSON.stringify({ correlationId, event: "http_request_completed", method: request.method, path: request.originalUrl?.split("?")[0], statusCode: response.statusCode, durationMs: Date.now() - startedAt })));
    next();
  });
  app.use((_: unknown, response: { setHeader(name: string, value: string): void }, next: () => void) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    next();
  });
  app.useBodyParser("json", { limit: "16kb" });
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PublicExceptionFilter());
  app.enableCors({
    origin: configuration.publicWebOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Idempotency-Key"],
    exposedHeaders: ["Retry-After", "X-Request-Id"],
    credentials: false,
  });
  app.enableShutdownHooks();

  return app;
}

async function bootstrap(): Promise<void> {
  const configuration = getApiConfiguration();
  const app = await createApiApplication(configuration);

  await app.listen(configuration.port, "0.0.0.0");
}

if (require.main === module) {
  void bootstrap();
}
