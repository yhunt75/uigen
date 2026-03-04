import { test, expect, beforeEach } from "vitest";
import {
  setHasAnonWork,
  getHasAnonWork,
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";

beforeEach(() => {
  sessionStorage.clear();
});

test("getHasAnonWork returns false when nothing is stored", () => {
  expect(getHasAnonWork()).toBe(false);
});

test("getHasAnonWork returns true after setHasAnonWork with messages", () => {
  setHasAnonWork([{ id: "1", role: "user", content: "hello" }], { "/": {} });
  expect(getHasAnonWork()).toBe(true);
});

test("getHasAnonWork returns true after setHasAnonWork with non-root file system entries", () => {
  setHasAnonWork([], { "/": {}, "/App.tsx": {} });
  expect(getHasAnonWork()).toBe(true);
});

test("setHasAnonWork does nothing when messages are empty and fs only has root", () => {
  setHasAnonWork([], { "/": {} });
  expect(getHasAnonWork()).toBe(false);
});

test("getAnonWorkData returns null when nothing stored", () => {
  expect(getAnonWorkData()).toBeNull();
});

test("getAnonWorkData returns stored messages and fileSystemData", () => {
  const messages = [{ id: "1", role: "user", content: "hello" }];
  const fileSystemData = { "/": {}, "/App.tsx": { content: "code" } };

  setHasAnonWork(messages, fileSystemData);

  const data = getAnonWorkData();
  expect(data).toMatchObject({ messages, fileSystemData });
});

test("getAnonWorkData returns null when stored data is invalid JSON", () => {
  sessionStorage.setItem("uigen_anon_data", "not-valid-json{");
  expect(getAnonWorkData()).toBeNull();
});

test("clearAnonWork removes stored data", () => {
  setHasAnonWork([{ id: "1", role: "user", content: "hi" }], { "/": {} });
  clearAnonWork();

  expect(getHasAnonWork()).toBe(false);
  expect(getAnonWorkData()).toBeNull();
});
