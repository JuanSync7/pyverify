import { Link } from "react-router-dom";

// The shortest path from "interested" to "I just ran it on my project".
export function StartPage() {
  return (
    <article className="page">
      <h1 className="page-title">Get started</h1>
      <p className="page-lede">
        pyverdex runs on any pytest project. The deterministic measurement + report need no API key
        and no model — add an LLM only when you want it to author tests.
      </p>

      <h2>1. Install</h2>
      <p>
        Python 3.11+. Install with <a href="https://docs.astral.sh/uv/" target="_blank" rel="noreferrer">uv</a>:
      </p>
      <pre>
        <code>{`git clone https://github.com/JuanSync7/pyverdex
cd pyverdex
uv sync          # installs LangGraph + the analysis toolchain`}</code>
      </pre>
      <p>
        <code>import pyverdex</code> works immediately. To run the <em>engine</em>, populate the
        vendored measurement tools once from your own checkout of the upstream toolkit:
      </p>
      <pre>
        <code>{`./scripts/sync-vendor.sh /path/to/juansync-synapse`}</code>
      </pre>
      <div className="callout">
        <span className="callout-label">why</span>
        <div>
          The 10 measurement tools are copies of a separate repo and are intentionally not committed
          here, so the sync step pulls them in. Running the engine and the test suite needs it.
        </div>
      </div>

      <h2>2. Verify a project</h2>
      <p>Point it at any pytest project. The layout (src / package / flat) is auto-detected.</p>
      <pre>
        <code>{`# Auto-approve every gate — good for CI:
uv run pyverdex run /path/to/project --yes

# Or stop at the first human gate, review, then resume:
uv run pyverdex run /path/to/project --thread myrun
uv run pyverdex resume --thread myrun --approve   # or --reject`}</code>
      </pre>
      <p>
        The unified report lands at{" "}
        <code>&lt;project&gt;/project/coverage/report/coverage-report.&#123;html,json&#125;</code>.
      </p>

      <h2>3. Let it author tests (optional)</h2>
      <p>
        Turn on apply-mode and pick a backend. <code>claude-code</code> uses your local{" "}
        <code>claude</code> CLI with <strong>no API key</strong>:
      </p>
      <pre>
        <code>{`PYVERDEX_GENERATE__APPLY=true \\
PYVERDEX_MODEL__PROVIDER=claude-code \\
uv run pyverdex run /path/to/project --yes`}</code>
      </pre>
      <p>
        Each authored test must pass the <Link to="/steps/generate">mutation gate</Link> before it
        sticks. See <Link to="/agents">agents &amp; backends</Link> for the full picture.
      </p>

      <h2>4. Open the dashboard</h2>
      <pre>
        <code>{`./demo/run_demo.sh                       # builds the UI, serves the demo on :8000
uv run pyverdex serve /path/to/project   # or point it at your own project`}</code>
      </pre>
      <p>
        The dashboard streams the run log live and embeds a real terminal in the project. Try the
        read-only version right here on the <Link to="/playground">playground</Link>.
      </p>

      <h2>Next</h2>
      <ul>
        <li>
          <Link to="/tutorials">Tutorials</Link> — wire it into your own project, close a real gap.
        </li>
        <li>
          <Link to="/concepts">Why multi-dimensional</Link> — what the numbers actually mean.
        </li>
        <li>
          <Link to="/config">Configuration</Link> — every knob.
        </li>
      </ul>
    </article>
  );
}
