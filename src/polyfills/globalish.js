// src/polyfills.js
(function() {
    // Prevent libraries from assigning to window.global
    Object.defineProperty(window, 'global', {
      value: window,
      writable: false,   // make it read-only
      configurable: false,
    });
  
    // Prevent assignments to window.undefined
    Object.defineProperty(window, 'undefined', {
      value: undefined,
      writable: false,
      configurable: false,
    });
  })();
  