import { describe, expect, test } from "vitest";
import { applyArrayChanges } from "../../src/utils/applyArrayChanges";

// Edit an assertion and save to see HMR in action

describe("applyArrayChanges", () => {
  test("should return the same array if there are no changes", () => {
    const a = [1, 2, 3];
    const changes = [1, 2, 3];
    expect(applyArrayChanges(a, changes)).toBe(a);
  });

  test("should return a new array if there are changes", () => {
    const a = [1, 2, 3];
    const changes = [1, 2, 4];
    expect(applyArrayChanges(a, changes)).not.toBe(a);
  });

  test("should handle nested arrays", () => {
    const a = [[1], [2], [3]];
    const changes = [[1], [2], [4]];
    expect(applyArrayChanges(a, changes)).toEqual([[1], [2], [4]]);
  });

  test("should handle nested arrays with changes", () => {
    const a = [[1], [2], [3]];
    const changes = [[1], [2], [4]];
    expect(applyArrayChanges(a, changes)).not.toBe(a);
  });

  test("should handle array trunaction", () => {
    const a = [1, 2, 3];
    const changes = [1, 2];
    expect(applyArrayChanges(a, changes)).toEqual([1, 2]);
  });

  test("should handle array expansion", () => {
    const a = [1, 2];
    const changes = [1, 2, 3];
    expect(applyArrayChanges(a, changes)).toEqual([1, 2, 3]);
  });
});
