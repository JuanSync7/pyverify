import { GateMode, StepKind } from "./content";

// Small colour-coded pills shared by the Pipeline and Steps pages so a reader
// can tell at a glance whether a stage is deterministic vs LLM-judgment, and
// whether it pauses for human approval.
export function KindPill({ kind }: { kind: StepKind }) {
  const label = kind === "judgment" ? "LLM judgment" : kind;
  return <span className={`pill pill-${kind}`}>{label}</span>;
}

export function GatePill({ gate }: { gate: GateMode }) {
  return (
    <span className={`pill pill-gate-${gate}`}>
      {gate === "gated" ? "human gate" : "auto"}
    </span>
  );
}

export function StepBadges({ kind, gate }: { kind: StepKind; gate: GateMode }) {
  return (
    <span className="pill-row">
      <KindPill kind={kind} />
      <GatePill gate={gate} />
    </span>
  );
}
