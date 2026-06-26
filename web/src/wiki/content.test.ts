import { describe, expect, it } from "vitest";
import {
  APPLY_MODE_LOOP,
  AUDIT_GENERATE_LOOP,
  BACKENDS,
  DIMENSIONS,
  getStep,
  PACKAGE_GROUPS,
  PACKAGES,
  PIPELINE,
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

  it("fully explains every step — why, how, coverage, outcome, gate, example", () => {
    for (const s of STEPS) {
      expect(s.why.length).toBeGreaterThan(0);
      expect(s.how.length).toBeGreaterThanOrEqual(3); // ordered internal phases
      for (const phase of s.how) expect(phase.length).toBeGreaterThan(0);
      expect(s.coverage.length).toBeGreaterThan(0);
      expect(s.outcome.length).toBeGreaterThan(0);
      expect(s.example.length).toBeGreaterThan(0);
      // the gate explanation must name the actual mode it documents
      expect(s.gateReason).toContain(s.gate === "gated" ? "gated" : "auto");
    }
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

  it("keeps the pipeline diagram in sync with every engine stage", () => {
    expect(PIPELINE.mermaid.startsWith("flowchart")).toBe(true);
    for (const s of STEPS) {
      expect(PIPELINE.mermaid).toContain(s.id);
    }
    // the audit⇄generate loop-back edge must exist (generate returns to audit)
    expect(PIPELINE.mermaid).toMatch(/generate[^\n]*audit/);
  });

  it("models the apply-mode and after_audit loops as mermaid flowcharts", () => {
    for (const d of [APPLY_MODE_LOOP, AUDIT_GENERATE_LOOP]) {
      expect(d.mermaid.startsWith("flowchart")).toBe(true);
      expect(d.caption.length).toBeGreaterThan(0);
    }
    expect(APPLY_MODE_LOOP.mermaid).toMatch(/mutation/i);
    expect(AUDIT_GENERATE_LOOP.mermaid).toMatch(/coverage met/i);
  });

  it("groups the Python stack into non-empty layers, each package fully described", () => {
    expect(PACKAGE_GROUPS.length).toBeGreaterThanOrEqual(3);
    for (const g of PACKAGE_GROUPS) {
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.blurb.length).toBeGreaterThan(0);
      expect(g.packages.length).toBeGreaterThan(0);
      for (const p of g.packages) {
        expect(p.name).toMatch(/^[a-z0-9][a-z0-9-]*$/); // a real PyPI name, no prose
        expect(p.role.length).toBeGreaterThan(0);
        expect(p.seenIn.length).toBeGreaterThan(0);
      }
    }
  });

  it("highlights the load-bearing packages (langgraph, pydantic, coverage, pytest, typer)", () => {
    const names = PACKAGES.map((p) => p.name);
    for (const n of ["langgraph", "pydantic", "coverage", "pytest", "typer"]) {
      expect(names).toContain(n);
    }
  });

  it("never lists mutmut or detect-secrets — pyverdex vendors its own measurement", () => {
    // The engine ships a custom AST mutation runner and entropy secret scanner;
    // surfacing these libraries here would imply a dependency that does not exist.
    const names = PACKAGES.map((p) => p.name);
    expect(names).not.toContain("mutmut");
    expect(names).not.toContain("detect-secrets");
  });

  it("has no duplicate packages across layers", () => {
    const names = PACKAGES.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
