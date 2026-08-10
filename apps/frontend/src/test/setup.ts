import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window !== "undefined" && window.HTMLDialogElement) {
  const prototype = window.HTMLDialogElement.prototype as unknown as {
    showModal(): void;
    close(returnValue?: string): void;
    open: boolean;
  };

  const original = {
    showModal: prototype.showModal,
    close: prototype.close,
  };

  prototype.showModal = function () {
    this.open = true;
    original.showModal?.call(this);
  };

  prototype.close = function (returnValue?: string) {
    this.open = false;
    original.close?.call(this, returnValue);
  };
}
