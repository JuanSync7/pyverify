import { describe, expect, it } from "vitest";
import {
  BACKENDS,
  DIMENSIONS,
  getStep,
  STEPS,
  THRESHOLDS,
  TOOLS,
} from "./content";

describe("wiki content model", () => {
  it("covers the seven coverage dimensions with a question + tool each", () => {
    const keys = DIMENSIONS.map((d) => d.key);
    expect(keys).toEqual([
      "line",
      "branch",
      "edge",
      "mutation",
      "assertion",
      "integration",
      "lint",
    ]);
    for (const d of DIMENSIONS) {
      expect(d.question.endsWith("?")).toBe(true);
      expect(d.tool.length).toBeGreaterThan(0);
      expect(d.why.length).toBeGreaterThan(0);
      expect(d.example.length).toBeGreaterThan(0);
    }
  });

  it("describes the seven pipeline steps in engine order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "lint",
      "fix",
      "audit",
      "generate",
      "evaluate",
      "integrate",
      "report",
    ]);
  });

  it("marks generate as a gated judgment step that uses the mutation gate", () => {
    const gen = getStep("generate")!;
    expect(gen.kind).toBe("judgment");
    expect(gen.gate).toBe("gated");
    expect(gen.tools).toContain("mutation_runner");
  });

  it("marks audit as the deterministic measurement core", () => {
    const audit = getStep("audit")!;
    expect(audit.kind).toBe("deterministic");
    expect(audit.outputs).toMatch(/coverage_met/);
  });

  it("includes the deterministic mutation_runner tool feeding the mutation dimension", () => {
    const mut = TOOLS.find((t) => t.name === "mutation_runner");
    expect(mut?.feeds).toContain("mutation");
  });

  it("offers a no-API-key claude-code backend", () => {
    const cc = BACKENDS.find((b) => b.id === "claude-code");
    expect(cc?.apiKey).toBe("none");
  });

  it("pins the mutation kill-rate threshold at 1.0", () => {
    const kill = THRESHOLDS.find((t) => t.key === "mutation_kill_rate");
    expect(kill?.value).toBe("1.0");
  });
});
