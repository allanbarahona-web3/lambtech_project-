import { strict as assert } from "node:assert";
import { test } from "node:test";

import { PrismaService } from "./prisma.service";

test("connects the Prisma client when the module initializes", async () => {
  const service = new PrismaService();
  let connectCalls = 0;
  Object.defineProperty(service, "$connect", {
    configurable: true,
    value: async () => {
      connectCalls += 1;
    },
  });

  await service.onModuleInit();

  assert.equal(connectCalls, 1);
});

test("disconnects the Prisma client when the module is destroyed", async () => {
  const service = new PrismaService();
  let disconnectCalls = 0;
  Object.defineProperty(service, "$disconnect", {
    configurable: true,
    value: async () => {
      disconnectCalls += 1;
    },
  });

  await service.onModuleDestroy();

  assert.equal(disconnectCalls, 1);
});
