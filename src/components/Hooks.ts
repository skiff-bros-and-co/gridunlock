import type React from "react";
import { useCallback, useEffect, useRef } from "react";

export const useKeypress = (action: (key: string) => void, deps: React.DependencyList) => {
  useEffect(() => {
    function onKeyup(e: globalThis.KeyboardEvent) {
      action(e.key);
    }
    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
  }, [action, ...deps]);
};

/**
 * `useCallback`, but with a constant reference.
 *
 * NOTE: Great care should be used. You CANNOT use the returned value in the render cycle.
 */
// biome-ignore lint/suspicious/noExplicitAny: grandfathered
export function useEventCallback<T extends (...args: any[]) => unknown>(callback: T, deps: React.DependencyList): T {
  const ref = useRef<T>((() => {
    throw new Error("Cannot call an event handler while rendering.");
    // biome-ignore lint/suspicious/noExplicitAny: grandfathered
  }) as any);

  useEffect(() => {
    ref.current = callback;
  }, [callback, ...deps]);

  return useCallback<T>(
    ((...args: Parameters<T>) => {
      const fn = ref.current;
      return fn(...args);
      // biome-ignore lint/suspicious/noExplicitAny: grandfathered
    }) as any,
    [],
  );
}
