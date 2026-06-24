// The signature element: a seven-cell instrument readout, one cell per
// verification dimension. Saturated colour appears only here, because the
// status of each dimension is the one thing on the page that is real data.

export type Status = "pass" | "fail" | "warn" | "idle";

export interface Channel {
  code: string;
  status: Status;
}

// The hero's story, made literal: line coverage reads a confident 100%, yet the
// dimensions that prove the tests actually verify anything are failing.
export const FALSE_SIGNAL_CHANNELS: Channel[] = [
  { code: "LINE", status: "pass" },
  { code: "BRCH", status: "warn" },
  { code: "EDGE", status: "fail" },
  { code: "MUT", status: "fail" },
  { code: "ASRT", status: "warn" },
  { code: "INTG", status: "idle" },
  { code: "LINT", status: "pass" },
];

export function DimensionReadout({ channels }: { channels: Channel[] }) {
  return (
    <div className="readout" role="img" aria-label="Per-dimension verification status: only line and lint pass; edge and mutation fail.">
      {channels.map((c) => (
        <div className="readout-cell" key={c.code}>
          <span className={`readout-dot ${c.status}`} aria-hidden="true" />
          <span className="readout-code">{c.code}</span>
        </div>
      ))}
    </div>
  );
}
