import { strict as assert } from "node:assert";
import { test } from "node:test";

import { NestFactory } from "@nestjs/core";

import { PrismaModule } from "./prisma.module";
import { PrismaService } from "./prisma.service";

test("resolves PrismaService from PrismaModule without a database connection", async () => {
  const originalConnect = PrismaService.prototype.$connect;
  const originalDisconnect = PrismaService.prototype.$disconnect;
  let connectCalls = 0;
  let disconnectCalls = 0;

  Object.defineProperty(PrismaService.prototype, "$connect", {
    configurable: true,
    value: async () => {
      connectCalls += 1;
    },
  });
  Object.defineProperty(PrismaService.prototype, "$disconnect", {
    configurable: true,
    value: async () => {
      disconnectCalls += 1;
    },
  });

  let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>> | undefined;

  try {
    app = await NestFactory.createApplicationContext(PrismaModule, {
      logger: false,
    });

    assert.ok(app.get(PrismaService));
    assert.equal(connectCalls, 1);

    await app.close();
    app = undefined;
    assert.equal(disconnectCalls, 1);
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
