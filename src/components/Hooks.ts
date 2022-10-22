import React, { useCallback, useEffect, useRef } from "react";

export const useKeypress = (action: (key: string) => void, deps: React.DependencyList) => {
  useEffect(() => {
    function onKeyup(e: globalThis.KeyboardEvent) {
      action(e.key);
    }
    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, ...deps]);
};

/**
 * `useCallback`, but with a constant reference.
 *
 * NOTE: Great care should be used. You CANNOT use the returned value in the render cycle.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventCallback<T extends (...args: any[]) => unknown>(callback: T, deps: React.DependencyList): T {
  const ref = useRef<T>((() => {
    throw new Error("Cannot call an event handler while rendering.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any);

  useEffect(() => {
    ref.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback<T>(
    ((...args: Parameters<T>) => {
      const fn = ref.current;
      return fn(...args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
    [ref],
  );
}
