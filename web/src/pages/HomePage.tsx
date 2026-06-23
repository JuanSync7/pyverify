import { Link } from "react-router-dom";
import { DIMENSIONS, PIPELINE_DIAGRAM } from "../wiki/content";

// The hook. A newcomer should leave this page understanding the one idea that
// makes pyverify worth using — green ≠ verified — and knowing exactly where to
// click next.
export function HomePage() {
  return (
    <article className="page">
      <div className="hero">
        <h1>Green tests can still be lying to you.</h1>
        <p className="sub">
          A passing suite at 100% line coverage can verify almost nothing. <strong>pyverify</strong>{" "}
          measures whether your tests <em>actually</em> check your code — across seven
          dimensions — and can author the tests that close the gaps.
        </p>
        <div className="cta-row">
          <Link className="cta primary" to="/start">
            Get started →
          </Link>
          <Link className="cta" to="/playground">
            Open the playground
          </Link>
          <Link className="cta" to="/concepts">
            Why it matters
          </Link>
        </div>
      </div>

      <h2>Line coverage + lint is a false signal</h2>
      <p>
        Line coverage only proves a line <em>ran</em> — not that any test would notice if it
        broke. A test that calls a function and asserts nothing still shows 100%. That number
        gives teams false confidence and hides real risk.
      </p>
      <p>
        pyverify treats verification as <strong>multi-dimensional</strong>. Each dimension answers
        a different question your coverage report can&apos;t:
      </p>

      <div className="wiki-grid" data-testid="dimension-teasers">
        {DIMENSIONS.map((d) => (
          <div className="wiki-card" key={d.key}>
            <h3>{d.name}</h3>
            <div className="q">{d.question}</div>
            <div className="meta">measured by {d.tool}</div>
          </div>
        ))}
      </div>

      <p>
        <Link to="/concepts">Read each dimension explained for a junior engineer →</Link>
      </p>

      <h2>One deterministic pipeline</h2>
      <p>
        pyverify is a <strong>LangGraph state machine</strong>: a fixed sequence of stages with a
        measure-and-improve loop in the middle. Deterministic tools do the measuring; an LLM only
        does the judgment work (authoring tests), behind human gates you control.
      </p>
      <pre>
        <code>{PIPELINE_DIAGRAM}</code>
      </pre>
      <p>
        <Link to="/pipeline">Walk through the pipeline →</Link>
      </p>

      <h2>Why you&apos;ll keep it</h2>
      <ul>
        <li>
          <strong>It catches what coverage hides</strong> — surviving mutants, untested branches,
          unwired integration seams, padded assertions.
        </li>
        <li>
          <strong>It closes the loop</strong> — in apply-mode it writes a test, proves it kills
          mutants, then re-measures, so the number actually goes up for the right reason.
        </li>
        <li>
          <strong>It runs anywhere</strong> — any pytest project, no API key required (the local{" "}
          <code>claude</code> CLI works headless), and the measurement + report run with no LLM at
          all.
        </li>
      </ul>
      <div className="cta-row">
        <Link className="cta primary" to="/start">
          Get started →
        </Link>
        <Link className="cta" to="/tutorials">
          See the tutorials
        </Link>
      </div>
    </article>
  );
}
