import { Suspense, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { GITHUB_URL, NAV } from "./nav";

// The wiki chrome: a slim top bar (brand + repo link + mobile menu toggle) and
// a left sidebar of sections, with the active page rendered into <Outlet/>.
export function WikiLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="wiki">
      <header className="wiki-top">
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          pyverify
        </Link>
        <span className="brand-tag">multi-dimensional test verification</span>
        <a className="gh-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </header>

      <div className="wiki-body">
        <nav className={`wiki-nav ${open ? "open" : ""}`} aria-label="Wiki sections">
          {NAV.map((section) => (
            <div className="nav-section" key={section.title}>
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <main className="wiki-main">
          <Suspense fallback={<div className="muted">Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
