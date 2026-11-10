import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  getApiConfiguration,
  parsePublicLeadSourceSiteOrigins,
  parsePublicWebOrigins,
} from "./config/api-configuration";
import { createApiApplication } from "./main";
import { PrismaService } from "./prisma/prisma.service";

const TEST_PUBLIC_WEB_ORIGINS = "http://localhost:3000,http://localhost:3002";
const TEST_SOURCE_SITE_ORIGINS = "http://localhost:3000=TECHNOLOGY,http://localhost:3002=FORMATION";

test("parses valid public web origins with trimming and de-duplication", () => {
  assert.deepEqual(
    parsePublicWebOrigins(
      " https://formation.barmentech.com,https://barmentech.com,https://formation.barmentech.com ",
    ),
    ["https://formation.barmentech.com", "https://barmentech.com"],
  );
});

test("rejects public web origins that are not exact safe origins", () => {
  for (const origin of [
    "https://*.barmentech.com",
    "https://user:password@barmentech.com",
    "https://barmentech.com/contact",
    "https://barmentech.com?source=test",
    "https://barmentech.com#contact",
    "not a url",
  ]) {
    assert.throws(() => parsePublicWebOrigins(origin));
  }
});

test("requires exact, CORS-listed mappings for both public lead source sites", () => {
  const origins = ["https://formation.example.test", "https://technology.example.test"];
  const mappings = parsePublicLeadSourceSiteOrigins(
    "https://formation.example.test=FORMATION,https://technology.example.test=TECHNOLOGY",
    origins,
  );
  assert.equal(mappings.get("https://formation.example.test"), "FORMATION");
  assert.equal(mappings.get("https://technology.example.test"), "TECHNOLOGY");

  for (const value of [
    "https://formation.example.test=FORMATION",
    "https://formation.example.test=FORMATION,https://technology.example.test=FORMATION",
    "https://formation.example.test=FORMATION,https://unknown.example.test=TECHNOLOGY",
    "https://formation.example.test/path=FORMATION,https://technology.example.test=TECHNOLOGY",
    "https://formation.example.test=FORMATION,https://technology.example.test=OTHER",
  ]) {
    assert.throws(() => parsePublicLeadSourceSiteOrigins(value, origins));
  }
});

test("requires valid public web origins in production", () => {
  assert.throws(
    () => getApiConfiguration({ NODE_ENV: "production" }),
    /PUBLIC_WEB_ORIGINS is required in production/,
  );
  assert.throws(
    () =>
      getApiConfiguration({
        NODE_ENV: "production",
        PUBLIC_WEB_ORIGINS: "https://*.barmentech.com",
      }),
    /must not contain wildcard origins/,
  );
});

test("requires secure non-local public origins outside development and test", () => {
  for (const publicWebOrigins of [
    "http://formation-qa.example.test",
    "http://localhost:3000",
  ]) {
    assert.throws(
      () =>
        getApiConfiguration({
          NODE_ENV: "qa",
          PUBLIC_WEB_ORIGINS: publicWebOrigins,
        PUBLIC_LEAD_SOURCE_SITE_ORIGINS: TEST_SOURCE_SITE_ORIGINS,
        }),
      /PUBLIC_WEB_ORIGINS must/,
    );
  }

  assert.equal(
    getApiConfiguration({
      NODE_ENV: "qa",
      PUBLIC_WEB_ORIGINS: "https://formation-qa.example.test,https://technology-qa.example.test",
      PUBLIC_LEAD_SOURCE_SITE_ORIGINS: "https://formation-qa.example.test=FORMATION,https://technology-qa.example.test=TECHNOLOGY",
      TRUST_PROXY: "loopback",
    }).trustProxy,
    "loopback",
  );
  assert.throws(
    () => getApiConfiguration({ TRUST_PROXY: "true", PUBLIC_WEB_ORIGINS: TEST_PUBLIC_WEB_ORIGINS, PUBLIC_LEAD_SOURCE_SITE_ORIGINS: TEST_SOURCE_SITE_ORIGINS }),
    /TRUST_PROXY/,
  );
});

test("serves the minimal health response at the versioned route", async () => {
  const originalConnect = PrismaService.prototype.$connect;
  const originalDisconnect = PrismaService.prototype.$disconnect;
  let app: Awaited<ReturnType<typeof createApiApplication>> | undefined;
  Object.defineProperty(PrismaService.prototype, "$connect", {
    configurable: true,
    value: async () => undefined,
  });
  Object.defineProperty(PrismaService.prototype, "$disconnect", {
    configurable: true,
    value: async () => undefined,
  });

  try {
    app = await createApiApplication(
      getApiConfiguration({
        NODE_ENV: "test",
        PUBLIC_WEB_ORIGINS: TEST_PUBLIC_WEB_ORIGINS,
        PUBLIC_LEAD_SOURCE_SITE_ORIGINS: TEST_SOURCE_SITE_ORIGINS,
      }),
    );
    await app.listen(0, "127.0.0.1");

    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.deepEqual(await response.json(), { status: "ok" });

    const invalidResponse = await fetch(
      `http://127.0.0.1:${address.port}/v1/public/leads`,
      {
        body: JSON.stringify({ unexpected: "value" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(invalidResponse.status, 400);
    assert.deepEqual(await invalidResponse.json(), {
      message: "Invalid request.",
      statusCode: 400,
    });

    const oversizedResponse = await fetch(
      `http://127.0.0.1:${address.port}/v1/public/leads`,
      {
        body: JSON.stringify({ message: "x".repeat(17 * 1024) }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    assert.equal(oversizedResponse.status, 413);
    assert.equal(oversizedResponse.headers.get("cache-control"), "no-store");
    const oversizedBody = await oversizedResponse.text();
    assert.equal(oversizedBody.includes("Request entity too large."), true);
    assert.equal(oversizedBody.includes("node_modules"), false);
    assert.equal(oversizedBody.includes("at "), false);
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
