// Writes the canonical seven-steps Markdown to two places:
//   1. ../../docs/SEVEN_STEPS.md   — committed to the repo, browsable on GitHub
//   2. ../public/seven-steps.md    — bundled into the build so the wiki can offer
//                                     it as a download (and the drift test reads it)
// Run from web/:  npm run gen:docs   (vite-node, already in the dev dependency tree)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderStepsMarkdown } from "./steps-doc";

const md = renderStepsMarkdown();

const targets = [
  new URL("../../docs/SEVEN_STEPS.md", import.meta.url),
  new URL("../public/seven-steps.md", import.meta.url),
];

for (const url of targets) {
  const path = fileURLToPath(url);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, md, "utf8");
  // eslint-disable-next-line no-console
  console.log(`wrote ${path} (${md.length} bytes)`);
}
