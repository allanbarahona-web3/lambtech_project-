import { strict as assert } from "node:assert";
import { test } from "node:test";

import { NestFactory } from "@nestjs/core";

import { PrismaService } from "../prisma/prisma.service";
import { PrivacyRequestsService } from "./privacy-requests.service";
import { PrivacyRequestsModule } from "./privacy-requests.module";

test("resolves privacy requests without direct email delivery dependencies", async () => {
  const originalConnect = PrismaService.prototype.$connect;
  const originalDisconnect = PrismaService.prototype.$disconnect;

  Object.defineProperty(PrismaService.prototype, "$connect", {
    configurable: true,
    value: async () => undefined,
  });
  Object.defineProperty(PrismaService.prototype, "$disconnect", {
    configurable: true,
    value: async () => undefined,
  });
  let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>> | undefined;
  try {
    const context = await NestFactory.createApplicationContext(PrivacyRequestsModule, {
      logger: false,
    });
    app = context;

    assert.ok(context.get(PrivacyRequestsService));
  } finally {
    await app?.close();
    Object.defineProperty(PrismaService.prototype, "$connect", {
      configurable: true,
      value: originalConnect,
    });
    Object.defineProperty(PrismaService.prototype, "$disconnect", {
      configurable: true,
      value: originalDisconnect,
    });
  }
});
