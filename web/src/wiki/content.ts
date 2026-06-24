// Single source of truth for the wiki's prose-as-data.
//
// Every fact here is drawn from the pyverdex source — `config/default.yaml`,
// `src/pyverdex/tools/adapters.py`, the skill subgraphs, and `docs/ARCHITECTURE.md`
// — NOT invented. Pages are thin renderers over this module, and the tests
// assert against it, so the wiki cannot silently drift from the engine.

export type DimensionKey =
  | "line"
  | "branch"
  | "edge"
  | "mutation"
  | "assertion"
  | "integration"
  | "lint";

export interface Dimension {
  key: DimensionKey;
  name: string;
  /** The plain-English question this dimension answers. */
  question: string;
  /** The tool that measures it. */
  tool: string;
  /** Why line coverage alone misses this. */
  why: string;
  /** A tiny, concrete junior-friendly illustration. */
  example: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    key: "line",
    name: "Line coverage",
    question: "Did each line of code actually run while the tests executed?",
    tool: "coverage.py + coverage_analyzer",
    why: "It is the baseline everyone already measures — necessary, but it only proves a line was reached, not that anything about it was checked.",
    example:
      "A test that calls `price(10)` and asserts nothing still marks every line of `price` as covered. 100% line coverage, zero verification.",
  },
  {
    key: "branch",
    name: "Branch coverage",
    question:
      "Which branches (if/else, loops, except) exist in each function, and are they all exercised?",
    tool: "branch_mapper",
    why: "A function can be 100% line-covered while a whole `else:` path is never taken — the line counts as covered by the `if` side.",
    example:
      "`if user.is_admin: ... else: ...` — testing only the admin path leaves the non-admin branch unverified even at 100% lines.",
  },
  {
    key: "edge",
    name: "Edge / function-to-function",
    question:
      "Which cross-package call seams (function A → function B) are actually wired together by a test?",
    tool: "coverage_analyzer --edges",
    why: "Unit tests with mocks cover each function in isolation but never prove the *connections* between packages hold — the integration seams.",
    example:
      "`api.checkout()` calls `pricing.total()` calls `inventory.reserve()`. Three green unit tests, but no test exercises the real chain end-to-end.",
  },
  {
    key: "mutation",
    name: "Mutation kill-rate",
    question:
      "If the code is deliberately corrupted, do the tests notice and fail?",
    tool: "mutation_runner",
    why: "This is the real test of assertion *strength*. Weak tests pass against broken code; strong tests fail. The single best signal that coverage is honest.",
    example:
      "Flip `a + b` to `a - b`. If every test still passes, the suite proves nothing about that line — a 'surviving mutant'. pyverdex's generate gate requires a 100% kill-rate.",
  },
  {
    key: "assertion",
    name: "Assertion quality",
    question: "Are the tests making meaningful checks, or are they padding?",
    tool: "assertion_quality",
    why: "Counts and weighs assertions per test so 'assert True' / no-assert tests are flagged instead of inflating the coverage number.",
    example:
      "A test with one trivial `assert result is not None` scores low; a test asserting the exact value, type, and side effects scores high. Minimum: 2 real assertions, score ≥ 0.5.",
  },
  {
    key: "integration",
    name: "Integration / system",
    question: "Are real services exercised end-to-end, or is everything mocked?",
    tool: "evaluate / integrate (judgment)",
    why: "A suite can be all green while every external dependency is faked — so it never proves the system actually works wired together.",
    example:
      "An over-mocked test asserts your mock returned what you told it to. The `evaluate` stage judges whether tests touch real seams; `integrate` proposes ones that do.",
  },
  {
    key: "lint",
    name: "Lint / security / secrets",
    question: "Is the code statically healthy — style, likely bugs, leaked secrets?",
    tool: "lint_reporter + secret_scanner",
    why: "The cheap static floor: catch the obvious defects and committed credentials before spending effort on dynamic measurement.",
    example:
      "An unused import or a hard-coded API key never shows up in coverage %, but `lint_reporter` and `secret_scanner` catch them in the first stage.",
  },
];

// --------------------------------------------------------------------------
// Pipeline steps — one compiled LangGraph subgraph each (skills/*.py).
// --------------------------------------------------------------------------

export type StepKind = "deterministic" | "judgment" | "mixed";
export type GateMode = "auto" | "gated";

export interface Step {
  id: string;
  name: string;
  kind: StepKind;
  /** Default gate from config/default.yaml. */
  gate: GateMode;
  /** One-line role in the pipeline. */
  summary: string;
  /** Junior-friendly explanation of what happens inside. */
  detail: string;
  /** Deterministic tools this step drives (adapter/vendored names). */
  tools: string[];
  inputs: string;
  outputs: string;
}

export const STEPS: Step[] = [
  {
    id: "lint",
    name: "lint",
    kind: "deterministic",
    gate: "auto",
    summary: "Static health floor — style, likely bugs, leaked secrets.",
    detail:
      "Runs the linters over the source tree and scans for committed secrets. No LLM. It is the cheap first pass that catches defects you should never pay dynamic-analysis time to find.",
    tools: ["lint_reporter", "secret_scanner"],
    inputs: "source tree",
    outputs: "lint findings + secret hits (the lint dimension)",
  },
  {
    id: "fix",
    name: "fix",
    kind: "mixed",
    gate: "gated",
    summary: "Auto-fix the mechanical, propose a plan for the rest.",
    detail:
      "Applies `ruff --fix` for the safely-automatable findings (deterministic), then asks the LLM for a remediation *plan* for what is left. Propose-only: it does not rewrite your logic unattended, which is why it is gated for human approval by default.",
    tools: ["lint_reporter (ruff --fix)"],
    inputs: "lint findings",
    outputs: "applied trivial fixes + an LLM remediation plan (proposed)",
  },
  {
    id: "audit",
    name: "audit",
    kind: "deterministic",
    gate: "auto",
    summary: "The measurement core — and the pivot of the loop.",
    detail:
      "Runs the test suite under coverage.py, then measures per-function line gaps, branch structure, boundary tiers, cross-package edges, and assertion quality. It computes whether every function meets its tier target and sets `coverage_met`. This is where the audit⇄generate loop decides whether to keep going.",
    tools: [
      "coverage.py",
      "coverage_analyzer",
      "branch_mapper",
      "boundary_classifier",
      "coverage_analyzer --edges",
      "assertion_quality",
    ],
    inputs: "source + test suite",
    outputs: "per-function multi-dimensional measurements + coverage_met",
  },
  {
    id: "generate",
    name: "generate",
    kind: "judgment",
    gate: "gated",
    summary: "Author tests for the gaps — and prove they are strong.",
    detail:
      "For each gap the audit found, the LLM authors a candidate test. In apply-mode it writes the test, runs it green, then gates it on `mutation_runner`: the test must kill 100% of mutants or it is re-strengthened with the surviving mutants fed back to the model. Only tests that pass the mutation gate stick — then `audit` re-measures. This is the loop that actually closes gaps.",
    tools: ["mutation_runner"],
    inputs: "coverage gaps from audit",
    outputs: "candidate tests (apply-mode: written + mutation-gated)",
  },
  {
    id: "evaluate",
    name: "evaluate",
    kind: "judgment",
    gate: "auto",
    summary: "Judge whether tests exercise real seams or just mocks.",
    detail:
      "Looks at the existing suite and judges integration effectiveness — are real services exercised, or is everything mocked into meaninglessness? Feeds the integration/system dimension.",
    tools: [],
    inputs: "test suite + measurements",
    outputs: "integration-effectiveness assessment",
  },
  {
    id: "integrate",
    name: "integrate",
    kind: "judgment",
    gate: "gated",
    summary: "Propose integration tests that hit real boundaries.",
    detail:
      "Authors candidate integration tests for the unwired seams `evaluate` flagged. Propose-only today; the apply-mode hooks (flakiness + cassette secret-scanning gates) are wired for when you opt in.",
    tools: ["flakiness_checker", "secret_scanner"],
    inputs: "integration assessment",
    outputs: "candidate integration tests (proposed)",
  },
  {
    id: "report",
    name: "report",
    kind: "deterministic",
    gate: "auto",
    summary: "Merge every dimension into one verdict.",
    detail:
      "Merges all dimensions per function into the UnifiedCoverageReport and writes `coverage-report.{json,html}`. Computes the overall verdict: fail if any dimension fails, warn if any did not run, else pass. This is the headline output — the dashboard you see in the Playground.",
    tools: [],
    inputs: "all dimension measurements",
    outputs: "coverage-report.{json,html} + overall verdict",
  },
];

export function getStep(id: string): Step | undefined {
  return STEPS.find((s) => s.id === id);
}

// --------------------------------------------------------------------------
// Deterministic toolbox — the vendored tools behind tools/adapters.py.
// Exit-code convention: 0 = pass/clean, 1 = findings/fail, 2 = tool error
// (coverage_analyzer: 0 = complete, 2 = error).
// --------------------------------------------------------------------------

export interface Tool {
  name: string;
  /** What it measures, plainly. */
  measures: string;
  /** Which dimension(s) it feeds. */
  feeds: string;
}

export const TOOLS: Tool[] = [
  {
    name: "lint_reporter",
    measures: "Static lint + security findings (ruff and friends) over the source.",
    feeds: "lint",
  },
  {
    name: "secret_scanner",
    measures: "Hard-coded credentials / secrets in a file or test cassette.",
    feeds: "lint, integrate",
  },
  {
    name: "coverage.py",
    measures: "Runs the suite and records which lines executed (the .coverage file).",
    feeds: "line",
  },
  {
    name: "coverage_analyzer",
    measures:
      "Per-function line gaps from the .coverage file; with --edges, the cross-package call graph.",
    feeds: "line, edge",
  },
  {
    name: "branch_mapper",
    measures: "Per-function branch structure (if/else, loops, except) via static AST.",
    feeds: "branch",
  },
  {
    name: "boundary_classifier",
    measures:
      "Classifies functions into tiers (boundary/critical vs internal) so thresholds apply correctly.",
    feeds: "line tiers",
  },
  {
    name: "assertion_quality",
    measures: "Scores assertion strength per test; flags padded / assertion-free tests.",
    feeds: "assertion",
  },
  {
    name: "mutation_runner",
    measures:
      "Mutates the code and checks the suite fails — the kill-rate. The generate gate.",
    feeds: "mutation",
  },
  {
    name: "flakiness_checker",
    measures: "Re-runs a test many times to detect non-determinism (default 10 runs).",
    feeds: "integrate (apply-mode gate)",
  },
  {
    name: "log_contract_validator",
    measures: "Checks log statements against a structured-logging policy.",
    feeds: "lint",
  },
  {
    name: "hypothesis_strategy_generator",
    measures: "Proposes property-based (Hypothesis) strategies for functions.",
    feeds: "generate (assist)",
  },
];

// --------------------------------------------------------------------------
// LLM backends for the judgment nodes (config: model.provider).
// --------------------------------------------------------------------------

export interface Backend {
  id: string;
  name: string;
  apiKey: string;
  memory: string;
  note: string;
}

export const BACKENDS: Backend[] = [
  {
    id: "claude-code",
    name: "claude-code (headless)",
    apiKey: "none",
    memory: "Resumes a claude CLI session across calls — state carried for free.",
    note: "The local `claude` CLI run headless. No API key needed; great for laptops and CI that already has the CLI.",
  },
  {
    id: "anthropic",
    name: "anthropic API",
    apiKey: "ANTHROPIC_API_KEY",
    memory: "History-based: prior turns replayed into each request.",
    note: "The Anthropic API directly (default model claude-sonnet-4-6). Best when you want explicit model control.",
  },
  {
    id: "fake",
    name: "fake / none",
    apiKey: "none",
    memory: "—",
    note: "No backend: judgment nodes log 'skipped' and the deterministic measurement + report still run. 'fake' is the deterministic stand-in used by the test suite.",
  },
];

// --------------------------------------------------------------------------
// Configuration facts (config/default.yaml).
// --------------------------------------------------------------------------

export interface ConfigItem {
  key: string;
  value: string;
  meaning: string;
}

export const THRESHOLDS: ConfigItem[] = [
  { key: "line_critical", value: "95.0%", meaning: "Line target for boundary / critical functions." },
  { key: "line_standard", value: "85.0%", meaning: "Line target for ordinary functions." },
  { key: "line_cold", value: "70.0%", meaning: "Line target for cold / rarely-run code." },
  { key: "mutation_kill_rate", value: "1.0", meaning: "generate gate: 100% of mutants must be killed." },
  { key: "assertion_score", value: "0.5", meaning: "Minimum assertion-quality score." },
  { key: "assertion_min", value: "2", meaning: "Minimum real assertions per generated test." },
  { key: "flakiness_max_fail_rate", value: "0.02", meaning: "Max tolerated flaky-fail rate (2%)." },
  { key: "flakiness_min_runs", value: "10", meaning: "Re-runs used to detect flakiness." },
];

export const LOOP: ConfigItem[] = [
  { key: "loop.max_cycles", value: "3", meaning: "Bound on the audit⇄generate loop (the 'Ralph budget')." },
  { key: "loop.max_gaps_per_cycle", value: "10", meaning: "Gaps generate will tackle per cycle." },
];

export const GENERATE_CFG: ConfigItem[] = [
  { key: "generate.apply", value: "false", meaning: "true ⇒ write tests to disk + re-audit (closes the loop). Off by default — nothing written unattended." },
  { key: "generate.restrengthen_attempts", value: "1", meaning: "Re-author cycles when mutants survive." },
  { key: "generate.mutation_max_lines", value: "20", meaning: "Cap on lines mutated per gap (keeps the gate fast)." },
];

// --------------------------------------------------------------------------
// The Python stack — the third-party libraries pyverdex is built on, grouped
// by the job they do. Every entry is a package the engine imports or invokes
// directly (checked against the source); `seenIn` names where so the claim is
// falsifiable. Deliberately ABSENT: mutmut and detect-secrets. pyverdex ships
// its own AST mutation runner and entropy/pattern secret scanner instead of
// calling those, so they never appear here as if they powered a measurement —
// the engine's own toolbox lives in TOOLS / the Deterministic tools page.
// --------------------------------------------------------------------------

export interface Package {
  /** PyPI / import name, exactly as engineers know it. */
  name: string;
  /** One line: the job it does for pyverdex. */
  role: string;
  /** Where it shows up in the engine — proof, not marketing. */
  seenIn: string;
}

export interface PackageGroup {
  title: string;
  /** One sentence framing what this layer is responsible for. */
  blurb: string;
  packages: Package[];
}

export const PACKAGE_GROUPS: PackageGroup[] = [
  {
    title: "Orchestration",
    blurb:
      "pyverdex is a LangGraph state machine — every step is a compiled subgraph and the audit⇄generate loop is an edge in the graph. This layer is model-agnostic by design: it depends on LangGraph, never on a model vendor.",
    packages: [
      {
        name: "langgraph",
        role: "The engine itself — each pipeline step is a compiled subgraph, and the audit⇄generate loop is a conditional edge.",
        seenIn: "graph.py · skills/*.py",
      },
      {
        name: "langgraph-checkpoint-sqlite",
        role: "Checkpoints graph state to SQLite, so a run can stop at a human gate and resume on the next invocation.",
        seenIn: "graph.py — SqliteSaver",
      },
    ],
  },
  {
    title: "Typed core",
    blurb:
      "Nothing in the pipeline passes around loose dicts. State, tool results, and report schemas are typed models, and configuration is layered and validated.",
    packages: [
      {
        name: "pydantic",
        role: "Tool results and the unified report are typed Pydantic models — which is why the graph branches on structured fields, not prose. (Graph state itself is a typed TypedDict.)",
        seenIn: "models.py · tools/vendored/*/schemas.py",
      },
      {
        name: "pydantic-settings",
        role: "Layered config: built-in defaults, then a config file, then PYVERDEX_* environment overrides.",
        seenIn: "config.py — Config(BaseSettings)",
      },
      {
        name: "pyyaml",
        role: "Parses the YAML config file and the per-project discovery rules (.pyverdex.yaml).",
        seenIn: "config.py · discovery.py",
      },
    ],
  },
  {
    title: "Measurement",
    blurb:
      "These produce the numbers. No model touches them — identical input gives identical output, which is what makes the report trustworthy.",
    packages: [
      {
        name: "coverage",
        role: "coverage.py runs the suite and records which lines executed — the raw line dimension and the .coverage file everything else reads.",
        seenIn: "adapters.py — collect_coverage",
      },
      {
        name: "ruff",
        role: "Fast Python linter, and the safe auto-fixer (ruff check --fix) the fix step applies.",
        seenIn: "lint_reporter · fix step",
      },
      {
        name: "mypy",
        role: "Static type checking, folded into the lint report.",
        seenIn: "lint_reporter",
      },
      {
        name: "bandit",
        role: "Security static analysis (SAST) for the lint dimension.",
        seenIn: "lint_reporter",
      },
      {
        name: "vulture",
        role: "Dead-code detection for the lint dimension.",
        seenIn: "lint_reporter",
      },
      {
        name: "hypothesis",
        role: "Property-based testing. The strategy generator proposes Hypothesis @given strategies for a function's inputs.",
        seenIn: "hypothesis_strategy_generator",
      },
    ],
  },
  {
    title: "Model layer",
    blurb:
      "Optional and pluggable. The judgment nodes (fix, generate, evaluate, integrate) reach an LLM through a small LLMBackend interface — the deterministic core needs none of it. One API provider is wired today; adding OpenAI, Google or a local model is a new backend, not a rewrite.",
    packages: [
      {
        name: "langchain-anthropic",
        role: "The one API provider wired today — binds Claude via ChatAnthropic (needs ANTHROPIC_API_KEY). The claude-code backend shells out to the local CLI with no package and no key; the fake backend needs neither.",
        seenIn: "backends.py · llm.py — ChatAnthropic",
      },
    ],
  },
  {
    title: "Run & present",
    blurb:
      "How a run is driven and how its verdict is shown — on the command line, as a standalone HTML report, and in the live dashboard.",
    packages: [
      {
        name: "pytest",
        role: "The runner everything executes under — coverage shells out to pytest to exercise the suite.",
        seenIn: "adapters.py",
      },
      {
        name: "typer",
        role: "The pyverdex command-line interface.",
        seenIn: "cli.py",
      },
      {
        name: "rich",
        role: "Readable, colourised terminal output and tables.",
        seenIn: "cli.py — Console, Table",
      },
      {
        name: "jinja2",
        role: "Renders the standalone HTML coverage report.",
        seenIn: "report/builder.py",
      },
      {
        name: "fastapi",
        role: "The dashboard / serve API the Playground talks to.",
        seenIn: "server/app.py",
      },
      {
        name: "uvicorn",
        role: "The ASGI server that hosts the dashboard.",
        seenIn: "cli.py — serve",
      },
    ],
  },
];

/** Flat list of every highlighted package, for counts and tests. */
export const PACKAGES: Package[] = PACKAGE_GROUPS.flatMap((g) => g.packages);

// --------------------------------------------------------------------------
// Flow diagrams, as Mermaid sources (rendered by <Mermaid>). All graphs in the
// wiki are Mermaid-driven — no hand-drawn ASCII. The `class … det|judge|
// terminal|decision` assignments reference the shared classes the <Mermaid>
// component injects; keep node ids in sync with STEPS so they can't drift.
// --------------------------------------------------------------------------

export interface Diagram {
  /** Mermaid flowchart source (without the shared classDefs). */
  mermaid: string;
  /** Doubles as the figure caption and the accessible label. */
  caption: string;
}

export const PIPELINE: Diagram = {
  mermaid: `flowchart TD
  start([start]) --> lint --> fix --> audit
  audit --> afteraudit{coverage met?}
  afteraudit -->|"gap + budget"| generate
  afteraudit -->|"coverage met"| evaluate
  generate -->|"re-measure"| audit
  evaluate --> integrate --> report --> done([end])
  class start,done terminal
  class lint,audit,report det
  class fix,generate,integrate,evaluate judge
  class afteraudit decision`,
  caption:
    "The pyverdex pipeline: lint, fix, audit, then the audit⇄generate loop, and out through evaluate, integrate, report.",
};

export const PIPELINE_COMPACT: Diagram = {
  mermaid: `flowchart TD
  start([start]) --> lint --> fix --> audit
  audit --> gap{gap?}
  gap -->|yes| generate --> audit
  gap -->|no| evaluate --> integrate --> report --> done([end])
  class start,done terminal
  class lint,audit,report det
  class fix,generate,integrate,evaluate judge
  class gap decision`,
  caption: "The pyverdex pipeline at a glance, with the audit⇄generate loop.",
};

export const APPLY_MODE_LOOP: Diagram = {
  mermaid: `flowchart TD
  start([gap selected]) --> author[author test]
  author --> green{green run?}
  green -->|no| restrengthen[re-strengthen]
  green -->|yes| mutate{mutation gate<br/>kill 100%?}
  mutate -->|survivors| restrengthen
  mutate -->|all killed| keep[keep test]
  restrengthen --> budget{attempts left?<br/>restrengthen_attempts}
  budget -->|yes| author
  budget -->|no| keep
  keep --> reaudit([audit re-measures])
  class start,reaudit terminal
  class author,keep,restrengthen judge
  class green,mutate,budget decision`,
  caption:
    "Apply-mode: author a test, require a green run, then gate on the mutation runner. Surviving mutants re-strengthen the test — bounded by restrengthen_attempts — and the final candidate is kept (recorded with its gate status) before audit re-measures.",
};

export const AUDIT_GENERATE_LOOP: Diagram = {
  mermaid: `flowchart TD
  audit[audit] --> met{coverage met?}
  met -->|yes| evaluate[evaluate]
  met -->|no| budget{cycle < max<br/>and not exhausted?}
  budget -->|no| evaluate
  budget -->|yes| generate[generate]
  generate -->|"re-measure"| audit
  class audit det
  class generate,evaluate judge
  class met,budget decision`,
  caption:
    "The after_audit decision: generate runs only while a gap remains and the cycle budget is not spent, then control returns to audit to re-measure.",
};
