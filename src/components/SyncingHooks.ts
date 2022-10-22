import { Dictionary } from "lodash";
import { fromPairs, omitBy } from "lodash-es";
import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";

export type SyncedImmutableMap<V> = Dictionary<V>;

export function useSyncedMap<V>(map: Y.Map<V>) {
  const [synced, setSynced] = useState<SyncedImmutableMap<V>>(() => fromPairs(Array.from(map.entries())));

  useEffect(() => {
    setSynced(fromPairs(Array.from(map.entries())));

    map.observe((ev) => {
      setSynced((prev) => {
        const deletedKeys = Array.from(ev.changes.keys.entries())
          .filter(([_key, change]) => change.action === "delete")
          .map(([key]) => key);
        const result = omitBy(prev, (_value, key) => deletedKeys.includes(key));

        for (const [key, change] of ev.changes.keys) {
          switch (change.action) {
            case "add":
            case "update":
              result[key] = map.get(key)!;
              break;
            case "delete":
              // Already omitted, to avoid having to use `delete`
              break;
            default: {
              console.error("Unknown update type???", key, change);
            }
          }
        }
        return result;
      });
    });
  }, [map]);

  const set = useCallback(
    (key: string, value: V) => {
      setSynced((prev) => ({ ...prev, [key]: value }));
      map.set(key, value);
    },
    [map],
  );

  return [synced, { set }] as const;
}
