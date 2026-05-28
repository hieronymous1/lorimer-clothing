import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { cache } from "react";

import type { LegacySeedData } from "@/lib/types";

const legacyPath = path.join(process.cwd(), "site", "data.js");

export const loadLegacySeedData = cache(async (): Promise<LegacySeedData> => {
  const source = await fs.readFile(legacyPath, "utf8");
  const sandbox = { window: {} as { LORIMER_DATA?: LegacySeedData } };

  vm.runInNewContext(source, sandbox, { filename: "site/data.js" });

  if (!sandbox.window.LORIMER_DATA) {
    throw new Error("Unable to load legacy Lorimer seed data.");
  }

  return sandbox.window.LORIMER_DATA;
});
