import { Link } from "react-router-dom";
import { DIMENSIONS } from "../wiki/content";

// The "why" page: teach the seven dimensions one at a time, each with the
// question it answers, why line coverage misses it, and a concrete example a
// junior engineer can picture.
export function ConceptsPage() {
  return (
    <article className="page">
      <h1 className="page-title">Why multi-dimensional</h1>
      <p className="page-lede">
        &ldquo;We&apos;re at 100% coverage&rdquo; sounds like done. It isn&apos;t. Line coverage is a
        <strong> false signal</strong> — it proves code <em>ran</em>, never that a test would
        <em> notice</em> if it broke. Real verification asks seven different questions.
      </p>

      <h2>The trap</h2>
      <p>
        Coverage tools instrument your code and count which lines executed during the tests. That
        is useful — code that never runs definitely isn&apos;t tested. But the reverse isn&apos;t
        true: a line running tells you nothing about whether anything was <em>checked</em>. This
        one-line test hits 100% coverage of <code>price()</code> and verifies nothing:
      </p>
      <pre>
        <code>{`def test_price():
    price(10)          # runs every line of price(), asserts nothing`}</code>
      </pre>
      <p>
        pyverify exists to replace that single misleading number with a set of honest ones. Here is
        each dimension, what it catches, and why coverage can&apos;t see it.
      </p>

      {DIMENSIONS.map((d, i) => (
        <section key={d.key}>
          <h2>
            {i + 1}. {d.name}
          </h2>
          <p className="q" style={{ color: "var(--accent)", fontSize: "1rem" }}>
            {d.question}
          </p>
          <p>{d.why}</p>
          <div className="callout">
            <span className="callout-label">example</span>
            <div>{d.example}</div>
          </div>
          <p className="meta" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Measured by <code>{d.tool}</code>.
          </p>
        </section>
      ))}

      <h2>Tiers: not every function needs the same bar</h2>
      <p>
        A boundary/critical function (an API entrypoint, a money calculation) is held to a higher
        line target than cold, rarely-run code. pyverify classifies functions and applies three
        tiers:
      </p>
      <table className="wiki-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Line target</th>
            <th>Applies to</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>critical / boundary</td>
            <td>95%</td>
            <td>entrypoints, public seams, high-risk logic</td>
          </tr>
          <tr>
            <td>standard</td>
            <td>85%</td>
            <td>ordinary internal functions</td>
          </tr>
          <tr>
            <td>cold</td>
            <td>70%</td>
            <td>rarely-executed / defensive code</td>
          </tr>
        </tbody>
      </table>

      <p>
        Next: see how these dimensions are produced in order by the{" "}
        <Link to="/pipeline">pipeline</Link>, or browse the{" "}
        <Link to="/tools">tools</Link> that measure each one.
      </p>
    </article>
  );
}
