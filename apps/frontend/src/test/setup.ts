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

if (typeof document !== "undefined") {
  const doc = document as Document & {
    fullscreenEnabled?: boolean;
    fullscreenElement?: Element | null;
    exitFullscreen?: () => Promise<void>;
  };

  if (doc.fullscreenEnabled === undefined) {
    doc.fullscreenEnabled = true;
  }
  if (doc.fullscreenElement === undefined) {
    doc.fullscreenElement = null;
  }

  const element = document.documentElement as HTMLElement & {
    requestFullscreen?: () => Promise<void>;
  };

  if (!element.requestFullscreen) {
    element.requestFullscreen = function () {
      doc.fullscreenElement = this;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    };
  }

  if (!doc.exitFullscreen) {
    doc.exitFullscreen = function () {
      doc.fullscreenElement = null;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    };
  }
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
