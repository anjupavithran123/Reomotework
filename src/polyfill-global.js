if (typeof globalThis.global === 'undefined') {
    Object.defineProperty(globalThis, 'global', {
      value: globalThis,
      writable: true,
      configurable: true,
    });
  }
  