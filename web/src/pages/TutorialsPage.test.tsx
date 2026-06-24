import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TutorialsPage } from "./TutorialsPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <TutorialsPage />
    </MemoryRouter>
  );
}

describe("TutorialsPage", () => {
  it("has a tutorial for wiring into any pytest project", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /wire pyverdex into/i })).toBeInTheDocument();
    expect(screen.getAllByText(/\.pyverdex\.yaml/).length).toBeGreaterThan(0);
  });

  it("has an apply-mode gap-closing tutorial driven by the mutation gate", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /apply-mode/i })).toBeInTheDocument();
    expect(screen.getAllByText(/PYVERDEX_GENERATE__APPLY/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/mutation/i).length).toBeGreaterThan(0);
  });

  it("has a browser/serve tutorial", () => {
    renderPage();
    expect(screen.getAllByText(/pyverdex serve/).length).toBeGreaterThan(0);
  });
});
