import shallowEquals from "shallow-equals";

/**
 * _very_ simple merging of 2 arrays.
 *
 * - A is primary
 * - Elements MUST be homogeneous
 * - Non-array elements use shallow equals.
 * - Arrays MUST be equal size.
 */
export function applyArrayChanges<V>(a: V[], changes: V[]): V[] {
  const isNestedArray = Array.isArray(a[0]);
  let hasChanges = false;
  const result: V[] = [];

  for (let i = 0; i < a.length; i++) {
    if (isNestedArray) {
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
