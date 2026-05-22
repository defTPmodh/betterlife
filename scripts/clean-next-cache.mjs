import { rmSync } from "node:fs";
import { join } from "node:path";

const nextCachePath = join(process.cwd(), ".next");

rmSync(nextCachePath, { recursive: true, force: true });
console.log("Cleared .next cache");
