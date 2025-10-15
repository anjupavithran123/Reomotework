// src/polyfills/globalish.js
if (typeof globalThis.global === 'undefined') {
    try {
      Object.defineProperty(globalThis, 'global', {
        value: globalThis,
        writable: true,
        configurable: true,
      });
    } catch (e) {
      globalThis.global = globalThis; // fallback if defineProperty fails
    }
  }
  