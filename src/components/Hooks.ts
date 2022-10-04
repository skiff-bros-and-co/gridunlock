import React, { useEffect } from "react";

export const useKeypress = (key: string, action: () => void, deps?: React.DependencyList) => {
  useEffect(() => {
    function onKeyup(e: any) {
      if (e.key === key) {
        action();
      }
    }
    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
  }, deps);
};
