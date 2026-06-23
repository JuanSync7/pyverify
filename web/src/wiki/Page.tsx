import { ReactNode } from "react";

// Consistent page header: a title, an optional lede, then the body content.
export function Page({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className="page">
      <h1 className="page-title">{title}</h1>
      {lede && <p className="page-lede">{lede}</p>}
      {children}
    </article>
  );
}

// A labelled "callout" box for tips / key takeaways.
export function Callout({ kind = "tip", children }: { kind?: string; children: ReactNode }) {
  return (
    <div className={`callout callout-${kind}`}>
      <span className="callout-label">{kind}</span>
      <div>{children}</div>
    </div>
  );
}
