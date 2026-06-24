import { Link } from "react-router-dom";
import { PACKAGES, PACKAGE_GROUPS } from "../wiki/content";

// The third-party layer: the well-known Python libraries pyverdex is built on,
// grouped by the job they do. This is the honest companion to the Deterministic
// tools page — those are pyverdex's *own* vendored tools; these are the
// shoulders it stands on. Every claim names where the package is used.
export function StackPage() {
  return (
    <article className="page">
      <h1 className="page-title">The Python stack</h1>
      <p className="page-lede">
        pyverdex doesn&apos;t reinvent the toolchain — it stands on{" "}
        <strong>{PACKAGES.length}</strong> well-known Python libraries and wires them into a single
        verdict. Here is every package it is built on, grouped by the job it does, with the exact
        place each one earns its keep.
      </p>

      {PACKAGE_GROUPS.map((g) => (
        <section key={g.title}>
          <h2>{g.title}</h2>
          <p>{g.blurb}</p>
          <div className="wiki-grid" data-testid={`stack-${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
            {g.packages.map((p) => (
              <div className="wiki-card pkg" key={p.name}>
                <h3 className="pkg-name">{p.name}</h3>
                <p className="q">{p.role}</p>
                <div className="meta">seen in · {p.seenIn}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="callout">
        <span className="callout-label">honest</span>
        <div>
          pyverdex ships its <strong>own</strong> deterministic measurement tools rather than calling
          others at measure time: the mutation runner is a custom AST engine — not{" "}
          <code>mutmut</code> — and the secret scanner is its own entropy/pattern matcher, not{" "}
          <code>detect-secrets</code>. Those libraries (with <code>freezegun</code> and{" "}
          <code>pytest-xdist</code>) are installed so the agent&apos;s playbooks and the tests it
          writes can use them, but the engine&apos;s own measurement never depends on them — that is
          what keeps a run reproducible. See the{" "}
          <Link to="/tools">deterministic tools</Link> pyverdex builds on top of these.
        </div>
      </div>
    </article>
  );
}
