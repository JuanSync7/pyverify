import { Link } from "react-router-dom";

// Hands-on, copy-pasteable walkthroughs. Each is a vertical slice: a real goal,
// the exact commands, and what you should see.
export function TutorialsPage() {
  return (
    <article className="page">
      <h1 className="page-title">Tutorials</h1>
      <p className="page-lede">
        Three short walkthroughs. The first wires pyverdex into a project you already have; the
        second closes a real coverage gap; the third drives it from the browser.
      </p>

      <h2>Tutorial 1 — Wire pyverdex into any pytest project</h2>
      <p>
        pyverdex auto-detects your layout, so usually there&apos;s nothing to configure. From the
        pyverdex checkout:
      </p>
      <pre>
        <code>{`uv run pyverdex run /path/to/your/project --yes`}</code>
      </pre>
      <p>
        It discovers the source root (<code>src/</code>, a package, or flat) and the{" "}
        <code>tests/</code> dir, runs the suite under coverage, measures every dimension, and writes
        the report. If your layout is unusual, drop a <code>.pyverdex.yaml</code> in the project
        root (or a <code>[tool.pyverdex]</code> table in <code>pyproject.toml</code>):
      </p>
      <pre>
        <code>{`# .pyverdex.yaml
paths:
  source_root: app
  test_root: test`}</code>
      </pre>
      <p>
        Open <code>project/coverage/report/coverage-report.html</code> — that&apos;s the same view
        the <Link to="/playground">playground</Link> renders.
      </p>

      <h2>Tutorial 2 — Close a coverage gap with apply-mode</h2>
      <p>This is the loop that makes the number go up for the right reason.</p>
      <ol>
        <li>
          Pick a backend. No API key? Use the local CLI:{" "}
          <code>export PYVERDEX_MODEL__PROVIDER=claude-code</code>.
        </li>
        <li>
          Turn on apply-mode: <code>export PYVERDEX_GENERATE__APPLY=true</code>.
        </li>
        <li>
          Run it: <code>uv run pyverdex run /path/to/project --yes</code>.
        </li>
      </ol>
      <p>Watch the log. For each gap, generate will:</p>
      <pre>
        <code>{`audit      → finds price() at 60% line, below its 85% target
generate   → authors a test, runs it green
mutation   → kills 100% of mutants? ✓ keep   ✗ re-strengthen with survivors
audit      → re-measures: price() now meets target
…loop until coverage_met or loop.max_cycles (3) is hit`}</code>
      </pre>
      <div className="callout">
        <span className="callout-label">tip</span>
        <div>
          Leave <code>generate</code> gated (the default) the first time so you approve each written
          test before it lands. Switch its gate to <code>auto</code> in{" "}
          <Link to="/config">config</Link> once you trust it.
        </div>
      </div>

      <h2>Tutorial 3 — Drive it from the browser</h2>
      <pre>
        <code>{`uv run pyverdex serve /path/to/project   # then open http://localhost:8000`}</code>
      </pre>
      <p>In the dashboard you can:</p>
      <ul>
        <li>discover the project layout and see source/test file lists;</li>
        <li>run a verification and watch the log stream live;</li>
        <li>read the verdict, dimension cards, and per-function table;</li>
        <li>
          use the embedded <strong>terminal</strong> to run <code>pytest</code> or{" "}
          <code>pyverdex run .</code> directly in the project.
        </li>
      </ul>
      <p>
        The <Link to="/playground">playground</Link> here is the same UI in read-only mode — paste a{" "}
        <code>serve</code> URL into its backend field to make it live.
      </p>
    </article>
  );
}
