// env.test.js
"use strict";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetEnvVars() {
  delete process.env.NODE_ENV;
  delete process.env.ENCRYPT_KEY;
  jest.resetModules();
}

describe("Environment Module", async () => {
  beforeEach(async () => {
    await resetEnvVars();
    // Set a known valid 64‑character hex key by default
    process.env.ENCRYPT_KEY = "a".repeat(64);
  });

  afterEach(async () => {
    await resetEnvVars();
  });

  describe("NODE_ENV handling", async () => {
    it("defaults to production when NODE_ENV is not set", async () => {
      const { default: env } = await import("../lib/env.js");
      expect(env.mode).toBe("production");
      expect(env.isProduction).toBe(true);
    });

    it("supports development aliases", async () => {
      process.env.NODE_ENV = "dev";
      const { default: env } = await import("../lib/env.js");
      expect(env.mode).toBe("development");
      expect(env.isDevelopment).toBe(true);
    });

    it("supports debugging aliases", async () => {
      process.env.NODE_ENV = "debugging";
      const { default: env } = await import("../lib/env.js");
      expect(env.mode).toBe("debugging");
      expect(env.isDebugging).toBe(true);
    });

    it("supports testing aliases", async () => {
      process.env.NODE_ENV = "test";
      const { default: env } = await import("../lib/env.js");
      expect(env.mode).toBe("testing");
      expect(env.isTesting).toBe(true);
    });

    it("normalizes unknown NODE_ENV to production", async () => {
      process.env.NODE_ENV = "something‑weird";
      const { default: env } = await import("../lib/env.js");
      expect(env.mode).toBe("production");
      expect(env.isProduction).toBe(true);
    });
  });

  describe("ENCRYPT_KEY validation", async () => {
    it("returns key if valid", async () => {
      const { default: env } = await import("../lib/env.js");
      process.env.ENCRYPT_KEY = "b".repeat(64);
      expect(env.encryptKey).toBe("b".repeat(64));
    });

    it("throws if ENCRYPT_KEY is missing", async () => {
      const { default: env } = await import("../lib/env.js");
      delete process.env.ENCRYPT_KEY;
      expect(() => {
        void env.encryptKey;
      }).toThrow(
        `"ENCRYPT_KEY" environment variable must be defined and be exactly 64 characters long.`
      );
    });

    it("throws if ENCRYPT_KEY is too short", async () => {
      const { default: env } = await import("../lib/env.js");
      process.env.ENCRYPT_KEY = "abc";
      expect(() => {
        void env.encryptKey;
      }).toThrow(/exactly 64 characters/);
    });
    /*
    it("throws if ENCRYPT_KEY is not hex", async () => {
      const { default: env } = await import("../lib/env.js");
      process.env.ENCRYPT_KEY = "z".repeat(64);
      expect(() => {
        void env.encryptKey;
      }).toThrow(`"ENCRYPT_KEY" must be a 64-character hexadecimal string.`);
    });
    */
  });
});
