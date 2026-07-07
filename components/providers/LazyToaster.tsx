"use client";

import { useEffect, useState, type ComponentType } from "react";

type ToasterComponent = ComponentType<{
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  richColors?: boolean;
}>;

export default function LazyToaster() {
  const [Toaster, setToaster] = useState<ToasterComponent | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const sonnerModule = await import("sonner");
      if (active) {
        setToaster(() => sonnerModule.Toaster);
      }
    };

    const requestIdleCallback = window.requestIdleCallback?.bind(window);
    const cancelIdleCallback = window.cancelIdleCallback?.bind(window);

    if (requestIdleCallback && cancelIdleCallback) {
      const idleId = requestIdleCallback(() => {
        void load();
      });
      return () => {
        active = false;
        cancelIdleCallback(idleId);
      };
    }

    const timerId = globalThis.setTimeout(() => {
      void load();
    }, 1200);

    return () => {
      active = false;
      globalThis.clearTimeout(timerId);
    };
  }, []);

  if (!Toaster) {
    return null;
  }

  return <Toaster position="top-center" richColors />;
}
