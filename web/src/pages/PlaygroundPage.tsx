import { Link } from "react-router-dom";
import { App } from "../App";

// The live dashboard, embedded in the wiki with a short "how to read it" tour.
// On GitHub Pages it renders the bundled sample report (static demo); paste a
// running `pyverdex serve` URL into the backend field to go live.
export function PlaygroundPage() {
  return (
    <article className="page" style={{ maxWidth: "none" }}>
      <div style={{ maxWidth: "760px" }}>
        <h1 className="page-title">Playground</h1>
        <p className="page-lede">
          This is the real pyverdex dashboard. Here it renders a bundled sample report so you can
          read a finished verdict; paste a running backend URL into the field below to run real
          verifications and use the in-browser terminal.
        </p>

        <h2>How to read it</h2>
        <ul>
          <li>
            <strong>Verdict row</strong> — the overall <code>pass</code>/<code>warn</code>/
            <code>fail</code> plus headline counts (functions, line gaps, edges, mutation kill-rate,
            weak tests).
          </li>
          <li>
            <strong>Dimension cards</strong> — one per <Link to="/concepts">dimension</Link>, each
            with its own status so a single weak dimension can&apos;t hide behind a high line %.
          </li>
          <li>
            <strong>Functions table</strong> — per-function line %, missing lines, branch count, and
            mutation kill-rate; boundary functions are marked with a red dot.
          </li>
          <li>
            <strong>Backend field</strong> — blank uses this bundled demo; a URL switches the whole
            UI to live mode against your <code>pyverdex serve</code>.
          </li>
        </ul>
        <div className="callout">
          <span className="callout-label">tip</span>
          <div>
            Run <code>uv run pyverdex serve /path/to/project</code> locally, then paste its URL
            (e.g. <code>http://localhost:8000</code>) below — the run log and terminal light up. See{" "}
            <Link to="/start">get started</Link>.
          </div>
        </div>
      </div>

      <div className="playground-embed" style={{ marginTop: "1.5rem" }}>
        <App />
      </div>
    </article>
  );
}
