import { Link } from "react-router-dom";
import { GENERATE_CFG, LOOP, STEPS, THRESHOLDS } from "../wiki/content";

function ItemTable({ rows, testid }: { rows: typeof THRESHOLDS; testid?: string }) {
  return (
    <table className="wiki-table" data-testid={testid}>
      <thead>
        <tr>
          <th>Key</th>
          <th>Default</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            <td>
              <code>{r.key}</code>
            </td>
            <td>
              <code>{r.value}</code>
            </td>
            <td>{r.meaning}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Everything is one YAML file, and every field is also overridable by an
// environment variable. This page is the reference for what you can turn.
export function ConfigPage() {
  return (
    <article className="page">
      <h1 className="page-title">Configuration</h1>
      <p className="page-lede">
        One file — <code>config/default.yaml</code> — holds every knob: thresholds, the loop bound,
        the model, and per-stage enable + gate. Every field is also overridable by an environment
        variable, so CI can tweak one value without editing the file.
      </p>

      <h2>Thresholds</h2>
      <p>The bars each dimension is measured against (the original test-audit tiers):</p>
      <ItemTable rows={THRESHOLDS} testid="threshold-table" />

      <h2>The loop</h2>
      <ItemTable rows={LOOP} />

      <h2>generate / apply-mode</h2>
      <p>
        Off by default — nothing is written to disk unattended. Turn <code>apply</code> on to let{" "}
        <Link to="/steps/generate">generate</Link> close gaps for real.
      </p>
      <ItemTable rows={GENERATE_CFG} />

      <h2>Model</h2>
      <p>
        The <code>model.provider</code> field picks the backend (<code>anthropic</code> /{" "}
        <code>claude-code</code> / <code>fake</code> — see <Link to="/agents">agents</Link>). The
        default model is <code>claude-sonnet-4-6</code> at <code>temperature: 0.0</code> for
        reproducibility.
      </p>
      <pre>
        <code>{`model:
  provider: "anthropic"        # or "claude-code" (no API key) / "fake"
  model: "claude-sonnet-4-6"
  claude_code_model: null      # CLI alias, e.g. "sonnet"; null => CLI default
  temperature: 0.0
  max_tokens: 8000`}</code>
      </pre>

      <h2>Per-stage enable + gate</h2>
      <p>
        The &ldquo;per-stage config toggle&rdquo;: switch any stage off, or change whether it pauses
        for human approval. <code>gated</code> ⇒ interrupt for approval; <code>auto</code> ⇒ run
        unattended.
      </p>
      <table className="wiki-table" data-testid="stage-table">
        <thead>
          <tr>
            <th>Stage</th>
            <th>enabled</th>
            <th>gate (default)</th>
          </tr>
        </thead>
        <tbody>
          {STEPS.map((s) => (
            <tr key={s.id}>
              <td>
                <Link to={`/steps/${s.id}`}>{s.name}</Link>
              </td>
              <td>
                <code>true</code>
              </td>
              <td>
                <code>{s.gate}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Environment overrides</h2>
      <p>
        Every field maps to a <code>PYVERDEX_</code>-prefixed variable; nested keys use a double
        underscore. A few examples:
      </p>
      <pre>
        <code>{`PYVERDEX_PROJECT_ROOT=/path/to/project
PYVERDEX_MODEL__PROVIDER=claude-code
PYVERDEX_MODEL__MODEL=claude-sonnet-4-6
PYVERDEX_GENERATE__APPLY=true`}</code>
      </pre>

      <h2>Paths</h2>
      <p>
        Outputs default under <code>project/coverage/</code> in the target project: the report at{" "}
        <code>report/coverage-report.&#123;html,json&#125;</code> and the resumable checkpoint DB at{" "}
        <code>state/checkpoints.sqlite</code>. Source/test roots are auto-detected but can be set
        with <code>paths.source_root</code> / <code>paths.test_root</code>.
      </p>

      <p>
        Ready to run it? <Link to="/start">Get started →</Link>
      </p>
    </article>
  );
}
