import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount React trees between tests so the jsdom document stays clean.
afterEach(() => cleanup());

// jsdom doesn't implement scrollTo on elements; the dashboard's log box calls
// it on mount. Stub it so embedding the dashboard in tests doesn't throw.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
