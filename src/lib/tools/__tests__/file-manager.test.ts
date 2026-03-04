import { test, expect, vi } from "vitest";
import { buildFileManagerTool } from "../file-manager";
import type { VirtualFileSystem } from "@/lib/file-system";

function makeMockFs(renameResult = true, deleteResult = true): VirtualFileSystem {
  return {
    rename: vi.fn().mockReturnValue(renameResult),
    deleteFile: vi.fn().mockReturnValue(deleteResult),
  } as unknown as VirtualFileSystem;
}

test("rename command calls fs.rename and returns success", async () => {
  const fs = makeMockFs();
  const tool = buildFileManagerTool(fs);

  const result = await tool.execute({ command: "rename", path: "/old.tsx", new_path: "/new.tsx" });

  expect(fs.rename).toHaveBeenCalledWith("/old.tsx", "/new.tsx");
  expect(result).toMatchObject({ success: true });
});

test("rename command returns error when new_path is missing", async () => {
  const fs = makeMockFs();
  const tool = buildFileManagerTool(fs);

  const result = await tool.execute({ command: "rename", path: "/old.tsx" });

  expect(fs.rename).not.toHaveBeenCalled();
  expect(result).toMatchObject({ success: false });
});

test("rename command returns error when fs.rename fails", async () => {
  const fs = makeMockFs(false);
  const tool = buildFileManagerTool(fs);

  const result = await tool.execute({ command: "rename", path: "/old.tsx", new_path: "/new.tsx" });

  expect(result).toMatchObject({ success: false });
});

test("delete command calls fs.deleteFile and returns success", async () => {
  const fs = makeMockFs();
  const tool = buildFileManagerTool(fs);

  const result = await tool.execute({ command: "delete", path: "/App.tsx" });

  expect(fs.deleteFile).toHaveBeenCalledWith("/App.tsx");
  expect(result).toMatchObject({ success: true });
});

test("delete command returns error when fs.deleteFile fails", async () => {
  const fs = makeMockFs(true, false);
  const tool = buildFileManagerTool(fs);

  const result = await tool.execute({ command: "delete", path: "/App.tsx" });

  expect(result).toMatchObject({ success: false });
});
