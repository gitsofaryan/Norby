"use strict";
exports.__esModule = true;
require("@testing-library/jest-dom/vitest");
var vitest_1 = require("vitest");
// Mock browser APIs
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vitest_1.vi.fn().mockImplementation(function (query) { return ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vitest_1.vi.fn(),
            removeListener: vitest_1.vi.fn(),
            addEventListener: vitest_1.vi.fn(),
            removeEventListener: vitest_1.vi.fn(),
            dispatchEvent: vitest_1.vi.fn()
        }); })
    });
    // Mock localStorage
    var localStorageMock = (function () {
        var store = {};
        return {
            getItem: function (key) { return store[key] || null; },
            setItem: function (key, value) {
                store[key] = value.toString();
            },
            removeItem: function (key) {
                delete store[key];
            },
            clear: function () {
                store = {};
            }
        };
    })();
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
    });
}
