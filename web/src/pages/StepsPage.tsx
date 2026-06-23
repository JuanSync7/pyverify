import { Link, useParams } from "react-router-dom";
import { getStep, STEPS } from "../wiki/content";
import { StepBadges } from "../wiki/StepBadges";

// Two views from one component: the index (all seven steps) and a single-step
// detail when /steps/:stepId is matched.
export function StepsPage() {
  const { stepId } = useParams();
  if (stepId) return <StepDetail id={stepId} />;
  return <StepIndex />;
}

function StepIndex() {
  return (
    <article className="page">
      <h1 className="page-title">The seven steps</h1>
      <p className="page-lede">
        Each stage of the pipeline is a compiled subgraph with one job. Deterministic stages
        measure; judgment stages ask an LLM to author or assess. Open any one for the detail.
      </p>
      <ol className="steplist" data-testid="step-index">
        {STEPS.map((s) => (
          <li key={s.id}>
            <div className="pill-row" style={{ justifyContent: "space-between" }}>
              <Link to={`/steps/${s.id}`}>{s.name}</Link>
              <StepBadges kind={s.kind} gate={s.gate} />
            </div>
            <div className="s">{s.summary}</div>
          </li>
        ))}
      </ol>
      <p>
        See how they connect in <Link to="/pipeline">the pipeline</Link>.
      </p>
    </article>
  );
}

function StepDetail({ id }: { id: string }) {
  const step = getStep(id);
  if (!step) {
    return (
      <article className="page">
        <Link className="step-back" to="/steps">
          ← all steps
        </Link>
        <h1 className="page-title">Unknown step</h1>
        <p>
          There&apos;s no stage called <code>{id}</code>. Pick one from{" "}
          <Link to="/steps">the seven steps</Link>.
        </p>
      </article>
    );
  }

  const idx = STEPS.findIndex((s) => s.id === id);
  const prev = idx > 0 ? STEPS[idx - 1] : null;
  const next = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;

  return (
    <article className="page">
      <Link className="step-back" to="/steps">
        ← all steps
      </Link>
      <h1 className="page-title">{step.name}</h1>
      <div className="pill-row" style={{ marginBottom: "1rem" }}>
        <StepBadges kind={step.kind} gate={step.gate} />
        <span className="meta" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          step {idx + 1} of {STEPS.length}
        </span>
      </div>

      <p className="page-lede">{step.summary}</p>
      <p>{step.detail}</p>

      <h2>What it reads and writes</h2>
      <table className="wiki-table">
        <tbody>
          <tr>
            <th>Kind</th>
            <td>
              {step.kind === "deterministic"
                ? "Deterministic — no LLM, identical output for identical input."
                : step.kind === "judgment"
                ? "LLM judgment — calls the configured model behind a gate."
                : "Mixed — a deterministic part plus an LLM-proposed part."}
            </td>
          </tr>
          <tr>
            <th>Gate</th>
            <td>
              {step.gate === "gated"
                ? "Pauses for human approval (interrupt) by default."
                : "Runs unattended by default."}
            </td>
          </tr>
          <tr>
            <th>Input</th>
            <td>{step.inputs}</td>
          </tr>
          <tr>
            <th>Output</th>
            <td>{step.outputs}</td>
          </tr>
        </tbody>
      </table>

      {step.tools.length > 0 && (
        <>
          <h2>Tools it drives</h2>
          <ul>
            {step.tools.map((t) => (
              <li key={t}>
                <code>{t}</code>
              </li>
            ))}
          </ul>
          <p className="meta" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            See the full <Link to="/tools">deterministic toolbox</Link>.
          </p>
        </>
      )}

      <div className="cta-row" style={{ marginTop: "2rem" }}>
        {prev && (
          <Link className="cta" to={`/steps/${prev.id}`}>
            ← {prev.name}
          </Link>
        )}
        {next && (
          <Link className="cta" to={`/steps/${next.id}`}>
            {next.name} →
          </Link>
        )}
      </div>
    </article>
  );
}
