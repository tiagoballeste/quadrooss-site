import { readFileSync } from "node:fs";
import path from "node:path";

export function readCargoScript(fileName: string) {
  const file = readFileSync(
    path.join(process.cwd(), "..", "cargo", "custom-code", fileName),
    "utf8",
  );

  return file
    .replace(/^\s*<script[^>]*>/i, "")
    .replace(/<\/script>\s*$/i, "");
}
