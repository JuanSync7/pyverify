import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// Smoke test: proves the vitest + jsdom + testing-library + JSX harness works
// before any real component is written (the first step of the TDD loop).
describe("test harness", () => {
  it("renders JSX into jsdom", () => {
    render(<h1>pyverdex wiki</h1>);
    expect(screen.getByRole("heading", { name: "pyverdex wiki" })).toBeInTheDocument();
  });
});
