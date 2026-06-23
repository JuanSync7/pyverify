import { Link } from "react-router-dom";
import { TOOLS } from "../wiki/content";

// The deterministic layer: the vendored measurement tools, what each one
// produces, and the dimension it feeds. No LLM touches any of this — identical
// input gives identical output, which is what makes the report trustworthy.
export function ToolsPage() {
  return (
    <article className="page">
      <h1 className="page-title">Deterministic tools</h1>
      <p className="page-lede">
        Every measurement in pyverify comes from a plain Python tool, not a model. Typed adapters
        (<code>tools/adapters.py</code>) shell out to each vendored tool, parse its JSON, and return
        a normalised <code>ToolResult</code>. These are the <strong>deterministic nodes</strong> of
        the graph.
      </p>

      <h2>Exit-code convention</h2>
      <p>
        The adapters share one contract inherited from the upstream tools, so the graph can branch
        on results without parsing prose. Each tool&apos;s process return code means:
      </p>
      <table className="wiki-table">
        <thead>
          <tr>
            <th>Exit code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>0</code>
            </td>
            <td>pass / clean (for coverage_analyzer: complete)</td>
          </tr>
          <tr>
            <td>
              <code>1</code>
            </td>
            <td>findings / fail — the tool ran fine but found problems</td>
          </tr>
          <tr>
            <td>
              <code>2</code>
            </td>
            <td>tool error — the tool itself failed to run</td>
          </tr>
        </tbody>
      </table>

      <h2>The toolbox</h2>
      <table className="wiki-table" data-testid="tool-table">
        <thead>
          <tr>
            <th>Tool</th>
            <th>What it measures</th>
            <th>Feeds</th>
          </tr>
        </thead>
        <tbody>
          {TOOLS.map((t) => (
            <tr key={t.name}>
              <td>
                <code>{t.name}</code>
              </td>
              <td>{t.measures}</td>
              <td className="meta" style={{ color: "var(--muted)" }}>
                {t.feeds}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Each <Link to="/steps">pipeline step</Link> drives a subset of these, and the{" "}
        <Link to="/config">configuration</Link> sets the thresholds they&apos;re measured against.
      </p>
    </article>
  );
}
