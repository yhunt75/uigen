import { test, expect, vi } from "vitest";
import { buildStrReplaceTool } from "../str-replace";
import type { VirtualFileSystem } from "@/lib/file-system";

function makeMockFs(): VirtualFileSystem {
  return {
    viewFile: vi.fn().mockReturnValue("line 1\nline 2"),
    createFileWithParents: vi.fn().mockReturnValue({ path: "/App.tsx" }),
    replaceInFile: vi.fn().mockReturnValue("ok"),
    insertInFile: vi.fn().mockReturnValue("ok"),
  } as unknown as VirtualFileSystem;
}

test("view command calls viewFile with path", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  const result = await tool.execute({ command: "view", path: "/App.tsx" });

  expect(fs.viewFile).toHaveBeenCalledWith("/App.tsx", undefined);
  expect(result).toBe("line 1\nline 2");
});

test("view command passes view_range when provided", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "view", path: "/App.tsx", view_range: [1, 10] });

  expect(fs.viewFile).toHaveBeenCalledWith("/App.tsx", [1, 10]);
});

test("create command calls createFileWithParents", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "create", path: "/Button.tsx", file_text: "export default function Button() {}" });

  expect(fs.createFileWithParents).toHaveBeenCalledWith("/Button.tsx", "export default function Button() {}");
});

test("create command uses empty string when file_text is omitted", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "create", path: "/empty.ts" });

  expect(fs.createFileWithParents).toHaveBeenCalledWith("/empty.ts", "");
});

test("str_replace command calls replaceInFile", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "str_replace", path: "/App.tsx", old_str: "foo", new_str: "bar" });

  expect(fs.replaceInFile).toHaveBeenCalledWith("/App.tsx", "foo", "bar");
});

test("str_replace command uses empty strings when old_str/new_str omitted", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "str_replace", path: "/App.tsx" });

  expect(fs.replaceInFile).toHaveBeenCalledWith("/App.tsx", "", "");
});

test("insert command calls insertInFile", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "insert", path: "/App.tsx", insert_line: 5, new_str: "const x = 1;" });

  expect(fs.insertInFile).toHaveBeenCalledWith("/App.tsx", 5, "const x = 1;");
});

test("insert command defaults to line 0 when insert_line omitted", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  await tool.execute({ command: "insert", path: "/App.tsx", new_str: "// comment" });

  expect(fs.insertInFile).toHaveBeenCalledWith("/App.tsx", 0, "// comment");
});

test("undo_edit returns unsupported error message", async () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  const result = await tool.execute({ command: "undo_edit", path: "/App.tsx" });

  expect(result).toContain("not supported");
});

test("tool has correct id", () => {
  const fs = makeMockFs();
  const tool = buildStrReplaceTool(fs);

  expect(tool.id).toBe("str_replace_editor");
});
