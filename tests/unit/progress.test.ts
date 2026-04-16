import { describe, it, expect, beforeEach } from "vitest";
import { useProgress, isAvailable, statusOf } from "@/lib/progress";

describe("progress store", () => {
  beforeEach(() => {
    useProgress.setState({ done: {}, hasHydrated: true });
    localStorage.clear();
  });

  it("markDone adds an id", () => {
    useProgress.getState().markDone("a");
    expect(useProgress.getState().done.a).toBe(true);
  });

  it("reset clears state", () => {
    useProgress.getState().markDone("a");
    useProgress.getState().markDone("b");
    useProgress.getState().reset();
    expect(Object.keys(useProgress.getState().done)).toHaveLength(0);
  });

  it("isAvailable requires all prerequisites done", () => {
    expect(isAvailable([], {})).toBe(true);
    expect(isAvailable(["a"], {})).toBe(false);
    expect(isAvailable(["a"], { a: true })).toBe(true);
    expect(isAvailable(["a", "b"], { a: true })).toBe(false);
    expect(isAvailable(["a", "b"], { a: true, b: true })).toBe(true);
  });

  it("statusOf distinguishes locked/available/done", () => {
    expect(statusOf("x", [], {})).toBe("available");
    expect(statusOf("x", ["y"], {})).toBe("suggested");
    expect(statusOf("x", ["y"], { y: true })).toBe("available");
    expect(statusOf("x", ["y"], { x: true, y: true })).toBe("done");
  });
});
