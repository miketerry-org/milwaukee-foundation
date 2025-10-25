// base.js:

"use strict";

import Config from "./config.js";
import msg from "./msg.js";

/**
 * @module base
 */

/**
 * Represents an abstract base class that cannot be instantiated directly.
 * Subclasses must extend this class.
 */
export default class Base {
  #config;

  /**
   * @param {Config} [config] - Optional configuration instance.
   * @throws {Error} If instantiated directly or config is not an instance of Config.
   */
  constructor(config = undefined) {
    if (new.target === Base) {
      throw new Error(msg.abstractClass);
    }

    // Validate that the provided config is a Config instance (if defined)
    if (config !== undefined && !(config instanceof Config)) {
      throw new TypeError(msg.invalidConfigParam);
    }

    // Store the config safely
    this.#config = config;
  }

  /**
   * Throws an error indicating that a subclass must override the method.
   * @param {string} methodName - The name of the method to override.
   * @throws {Error}
   */
  requireOverride(methodName) {
    throw new Error(msg.methodMustBeOverridden);
  }

  /**
   * Returns the configuration object passed to the constructor.
   * @returns {Config|undefined}
   */
  get config() {
    return this.#config;
  }
}
