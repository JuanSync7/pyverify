import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConfigPage } from "./ConfigPage";
import { STEPS, THRESHOLDS } from "../wiki/content";

function renderPage() {
  return render(
    <MemoryRouter>
      <ConfigPage />
    </MemoryRouter>
  );
}

describe("ConfigPage", () => {
  it("documents every threshold", () => {
    renderPage();
    const table = screen.getByTestId("threshold-table");
    for (const t of THRESHOLDS) {
      expect(within(table).getByText(t.key)).toBeInTheDocument();
    }
    expect(within(table).getByText("1.0")).toBeInTheDocument();
  });

  it("shows the per-stage enable + gate matrix", () => {
    renderPage();
    const table = screen.getByTestId("stage-table");
    for (const s of STEPS) {
      expect(within(table).getByText(s.name)).toBeInTheDocument();
    }
  });

  it("documents env overrides", () => {
    renderPage();
    expect(screen.getAllByText(/PYVERDEX_/).length).toBeGreaterThan(0);
  });

  it("documents the model provider", () => {
    renderPage();
    expect(screen.getAllByText(/provider/i).length).toBeGreaterThan(0);
  });
});
