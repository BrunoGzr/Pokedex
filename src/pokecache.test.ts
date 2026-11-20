import { afterEach, describe, expect, test } from "vitest";

import { Cache } from "./pokecache.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Cache", () => {
  let cache: Cache | undefined;

  afterEach(() => {
    cache?.stopReapLoop();
    cache = undefined;
  });

  test("adds and retrieves a value", () => {
    cache = new Cache(1000);
    cache.add("hello", "world");
    expect(cache.get<string>("hello")).toBe("world");
  });

  test("returns undefined for a missing key", () => {
    cache = new Cache(1000);
    expect(cache.get<string>("missing")).toBeUndefined();
  });

  test("replaces the value of an existing key", () => {
    cache = new Cache(1000);
    cache.add("key", "first");
    cache.add("key", "second");
    expect(cache.get<string>("key")).toBe("second");
  });

  test("keeps different keys separate", () => {
    cache = new Cache(1000);
    cache.add("a", 1);
    cache.add("b", 2);
    expect(cache.get<number>("a")).toBe(1);
    expect(cache.get<number>("b")).toBe(2);
  });

  test("stores objects without losing their shape", () => {
    cache = new Cache(1000);
    const value = { name: "pikachu", id: 25 };
    cache.add("pokemon", value);
    expect(cache.get<typeof value>("pokemon")).toEqual(value);
  });

  test("keeps fresh entries available", () => {
    cache = new Cache(50);
    cache.add("fresh", "value");
    expect(cache.get<string>("fresh")).toBe("value");
  });

  test("removes entries older than the interval", async () => {
    cache = new Cache(20);
    cache.add("old", "value");
    await sleep(60);
    expect(cache.get<string>("old")).toBeUndefined();
  });
});
