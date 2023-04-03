import shallowEquals from "shallow-equals";

/**
 * _very_ simple merging of 2 arrays.
 *
 * - Elements MUST be homogeneous
 * - Non-array elements use shallow equals.
 * - If changes.length < a.length, result is cut to changes.length
 * - Similarly, additions to changes result in additions to a
 */
export function applyArrayChanges<V>(a: V[], changes: V[]): V[] {
  const isNestedArray = Array.isArray(a[0]);
  let hasChanges = a.length !== changes.length;
  const result: V[] = [];

  for (let i = 0; i < changes.length; i++) {
    if (i >= a.length) {
      result.push(changes[i]);
    } else if (isNestedArray) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.push(applyArrayChanges(a[i] as any, changes[i] as any) as any);
    } else {
      result.push(shallowEquals(a[i], changes[i]) ? a[i] : changes[i]);
    }

    hasChanges = hasChanges || result[i] !== a[i];
  }

  if (!hasChanges) {
    return a;
  }

  return result;
}
