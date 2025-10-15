// src/polyfills/globalish.js
if (typeof globalThis.global === 'undefined') {
    try {
      Object.defineProperty(globalThis, 'global', {
        value: globalThis,
        writable: true,
        configurable: true,
      });
    } catch (e) {
      // fallback if defineProperty fails in some environment
      globalThis.global = globalThis;
    }
  }
  