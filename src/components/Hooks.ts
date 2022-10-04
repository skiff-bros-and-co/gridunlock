import React, { useEffect } from "react";

export const useKeypress = (action: (key: string) => void, deps?: React.DependencyList) => {
  useEffect(() => {
    function onKeyup(e: globalThis.KeyboardEvent) {
      action(e.key);
    }
    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
  }, deps);
};
