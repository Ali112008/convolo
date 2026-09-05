"use client";

import { useEffect } from "react";

/** Registers the optional offline shell after the client has mounted. */
export function PwaController() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const timer = window.setTimeout(() => {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
