// verify.test.js:

"use strict";

import verify from "../lib/verify.js";

describe("verify module", async () => {
  describe("isBoolean", async () => {
    it("should accept valid boolean", async () => {
      const data = { active: true };
      const result = verify(data).isBoolean("active", true).errors;
      expect(result).toEqual([]);
    });

    it("should assign default when missing", async () => {
      const data = {};
      verify(data).isBoolean("active", false, true);
      expect(data.active).toBe(true);
    });

    it("should return error if not boolean", async () => {
      const data = { active: "yes" };
      const result = verify(data).isBoolean("active", true).errors;
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("isCompare", async () => {
    it("should pass when values match", async () => {
      const data = { password: "abc123", confirm: "abc123" };
      const result = verify(data).isCompare("confirm", "password", true).errors;
      expect(result).toEqual([]);
    });

    it("should fail when values differ", async () => {
      const data = { password: "abc123", confirm: "def456" };
      const result = verify(data).isCompare("confirm", "password", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isDate", async () => {
    it("should validate date instance", async () => {
      const data = { dob: new Date() };
      const result = verify(data).isDate("dob", true).errors;
      expect(result).toEqual([]);
    });

    it("should fail for invalid date", async () => {
      const data = { dob: "not-a-date" };
      const result = verify(data).isDate("dob", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isEmail", async () => {
    it("should accept valid email", async () => {
      const data = { email: "test@example.com" };
      const result = verify(data).isEmail("email", true).errors;
      expect(result).toEqual([]);
    });

    it("should reject invalid email", async () => {
      const data = { email: "not-an-email" };
      const result = verify(data).isEmail("email", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isEnum", async () => {
    it("should accept valid enum value", async () => {
      const data = { role: "admin" };
      const result = verify(data).isEnum("role", true, [
        "admin",
        "user",
      ]).errors;
      expect(result).toEqual([]);
    });

    it("should reject invalid enum value", async () => {
      const data = { role: "guest" };
      const result = verify(data).isEnum("role", true, [
        "admin",
        "user",
      ]).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isInteger", async () => {
    it("should pass for integer", async () => {
      const data = { count: 42 };
      const result = verify(data).isInteger("count", true).errors;
      expect(result).toEqual([]);
    });

    it("should fail for non-integer", async () => {
      const data = { count: 3.14 };
      const result = verify(data).isInteger("count", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isNumber", async () => {
    it("should pass for number", async () => {
      const data = { price: 9.99 };
      const result = verify(data).isNumber("price", true).errors;
      expect(result).toEqual([]);
    });

    it("should fail for non-number", async () => {
      const data = { price: "free" };
      const result = verify(data).isNumber("price", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isObject", async () => {
    it("should pass for object", async () => {
      const data = { meta: { version: 1 } };
      const result = verify(data).isObject("meta", true).errors;
      expect(result).toEqual([]);
    });

    it("should fail for non-object", async () => {
      const data = { meta: "json" };
      const result = verify(data).isObject("meta", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isPassword", async () => {
    it("should pass strong password", async () => {
      const data = { pwd: "StrongPass#2023" };
      const result = verify(data).isPassword("pwd", true).errors;
      expect(result).toEqual([]);
    });

    it("should fail weak password", async () => {
      const data = { pwd: "weakpass" };
      const result = verify(data).isPassword("pwd", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isMatch", async () => {
    it("should pass when string matches regex", async () => {
      const data = { username: "john_doe" };
      const result = verify(data).isMatch(
        "username",
        true,
        /^[a-z0-9_]+$/i
      ).errors;
      expect(result).toEqual([]);
    });

    it("should fail when regex does not match", async () => {
      const data = { username: "invalid username!" };
      const result = verify(data).isMatch(
        "username",
        true,
        /^[a-z0-9_]+$/i
      ).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isString", async () => {
    it("should validate string with length", async () => {
      const data = { title: "Hello World" };
      const result = verify(data).isString("title", true, 5, 20).errors;
      expect(result).toEqual([]);
    });

    it("should fail if string is too short", async () => {
      const data = { title: "Hi" };
      const result = verify(data).isString("title", true, 5, 20).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isTime", async () => {
    it("should accept valid time", async () => {
      const data = { start: "14:30" };
      const result = verify(data).isTime("start", true).errors;
      expect(result).toEqual([]);
    });

    it("should reject invalid time", async () => {
      const data = { start: "25:99" };
      const result = verify(data).isTime("start", true).errors;
      expect(result.length).toBe(1);
    });
  });

  describe("isTimestamp", async () => {
    it("should accept valid timestamp", async () => {
      const data = { created: new Date() };
      const result = verify(data).isTimestamp("created", true).errors;
      expect(result).toEqual([]);
    });

    it("should reject invalid timestamp", async () => {
      const data = { created: "today" };
      const result = verify(data).isTimestamp("created", true).errors;
      expect(result.length).toBe(1);
    });
  });
});
