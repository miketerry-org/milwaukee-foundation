// config.js:

"use strict";

import fs from "fs";
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

export default class Config {
  /**
   * Validate configuration values after they have been loaded.
   *
   * This method is intended to be overridden by subclasses to enforce
   * specific schema, type, or value constraints on configuration data.
   *
   * Example:
   * ```js
   * class MyConfig extends Config {
   *   validate(values) {
   *     if (!values.DB_HOST) throw new Error("DB_HOST is required");
   *     if (isNaN(Number(values.DB_PORT))) throw new Error("DB_PORT must be numeric");
   *   }
   * }
   * ```
   *
   * @param {object} values - The current configuration instance containing loaded values.
   * @throws {Error} Implementations should throw an error if validation fails.
   */
  validate(values) {}

  /**
   * Load environment variables from a plain or encrypted .env file.
   * Properties are set as read-only on the instance.
   * @param {string} filename
   * @param {string|undefined} encryptKey
   */
  loadEnvFile(filename, encryptKey = undefined) {
    let fileContent = fs.readFileSync(filename);

    if (encryptKey) {
      fileContent = this.decrypt(fileContent, encryptKey);
    }

    fileContent
      .toString()
      .split("\n")
      .forEach(line => {
        const [key, value] = line.split("=");
        if (key && value) {
          Object.defineProperty(this, key.trim(), {
            value: value.trim(),
            writable: false,
            configurable: false,
            enumerable: true,
          });
        }
      });

    // allow extended classes to validate config values
    this.validate(this);
  }

  /**
   * Save environment variables to a plain or encrypted .env file.
   * Serializes this object's own enumerable string properties as name=value lines.
   * @param {string} filename
   * @param {string|undefined} encryptKey
   */
  saveEnvFile(filename, encryptKey = undefined) {
    const lines = Object.entries(this)
      .filter(([key, val]) => typeof val === "string")
      .map(([key, val]) => `${key}=${val}`);

    const content = lines.join("\n");

    let outputBuffer;
    if (encryptKey) {
      outputBuffer = this.encrypt(Buffer.from(content, "utf8"), encryptKey);
    } else {
      outputBuffer = Buffer.from(content, "utf8");
    }

    fs.writeFileSync(filename, outputBuffer);
  }

  /**
   * Load JSON config from a plain or encrypted JSON file.
   * Properties are set as read-only on the instance.
   * @param {string} filename
   * @param {string|undefined} encryptKey
   */
  loadJSONFile(filename, encryptKey = undefined) {
    let fileContent = fs.readFileSync(filename);

    if (encryptKey) {
      fileContent = this.decrypt(fileContent, encryptKey);
    }

    const jsonString = fileContent.toString("utf8");
    const jsonObj = JSON.parse(jsonString);

    Object.entries(jsonObj).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        value,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    });

    // allow extended class to validate config values
    this.validate(this);
  }

  /**
   * Save current config as JSON to a plain or encrypted file.
   * Serializes own enumerable properties (including non-string).
   * @param {string} filename
   * @param {string|undefined} encryptKey
   */
  saveJSONFile(filename, encryptKey = undefined) {
    const jsonObj = {};

    Object.entries(this).forEach(([key, value]) => {
      if (typeof value !== "function") {
        jsonObj[key] = value;
      }
    });

    const jsonString = JSON.stringify(jsonObj, null, 2);

    let outputBuffer;
    if (encryptKey) {
      outputBuffer = this.encrypt(Buffer.from(jsonString, "utf8"), encryptKey);
    } else {
      outputBuffer = Buffer.from(jsonString, "utf8");
    }

    fs.writeFileSync(filename, outputBuffer);
  }

  /**
   * AES-256-CBC encrypt a buffer.
   * @param {Buffer} data
   * @param {string} encryptKey - must be 32 bytes for AES-256
   * @returns {Buffer} - IV prepended to ciphertext
   */
  encrypt(data, encryptKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(encryptKey, "utf8");
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * AES-256-CBC decrypt a buffer.
   * @param {Buffer} encryptedData - IV prepended ciphertext
   * @param {string} encryptKey
   * @returns {Buffer} - decrypted data
   */
  decrypt(encryptedData, encryptKey) {
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encryptedText = encryptedData.slice(IV_LENGTH);
    const key = Buffer.from(encryptKey, "utf8");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    return Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  }
}
