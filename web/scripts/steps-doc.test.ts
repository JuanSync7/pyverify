import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderStepsMarkdown } from "./steps-doc";
import { STEPS } from "../src/wiki/content";

// This test lives in scripts/ (outside the app tsconfig) because it reads files
// off disk. Vitest runs with cwd = web/, so paths resolve from there.

describe("seven-steps markdown doc", () => {
  it("matches the committed copies (run `npm run gen:docs` if this fails)", () => {
    const generated = renderStepsMarkdown();
    for (const rel of ["public/seven-steps.md", "../docs/SEVEN_STEPS.md"]) {
      const onDisk = readFileSync(resolve(process.cwd(), rel), "utf8");
      expect(onDisk, `${rel} is stale — run \`npm run gen:docs\``).toBe(generated);
    }
  });

  it("documents every step with all six explanatory facets", () => {
    const md = renderStepsMarkdown();
    for (const s of STEPS) {
      expect(md).toContain(`. ${s.name}\n`); // a "## NN. <name>" section
    }
    for (const heading of [
      "### What it does",
      "### Why this step exists",
      "### How it operates",
      "### How it determines coverage",
      "### Example",
      "### What it drives next",
    ]) {
      const count = md.split(heading).length - 1;
      expect(count, `every step needs "${heading}"`).toBe(STEPS.length);
    }
  });
});
