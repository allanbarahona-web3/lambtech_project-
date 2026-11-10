import { strict as assert } from "node:assert";
import { test } from "node:test";

import { getPublicClientIp } from "./public-client-ip";

test("normalizes valid public client IP addresses and collapses unusable input", () => {
  assert.equal(getPublicClientIp("192.0.2.10"), "192.0.2.10");
  assert.equal(getPublicClientIp("::ffff:192.0.2.10"), "192.0.2.10");
  assert.equal(getPublicClientIp("2001:DB8::1"), "2001:db8::1");
  assert.equal(getPublicClientIp(undefined), "unknown");
  assert.equal(getPublicClientIp("not-an-ip"), "unknown");
});
