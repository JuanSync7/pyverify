import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConceptsPage } from "./ConceptsPage";
import { DIMENSIONS } from "../wiki/content";

function renderPage() {
  return render(
    <MemoryRouter>
      <ConceptsPage />
    </MemoryRouter>
  );
}

describe("ConceptsPage", () => {
  it("explains the false-signal premise", () => {
    renderPage();
    expect(screen.getAllByText(/false signal/i).length).toBeGreaterThan(0);
  });

  it("gives every dimension a section with its why and example", () => {
    renderPage();
    for (const d of DIMENSIONS) {
      expect(screen.getByRole("heading", { name: new RegExp(d.name, "i") })).toBeInTheDocument();
      expect(screen.getByText(d.example)).toBeInTheDocument();
      expect(screen.getByText(d.why)).toBeInTheDocument();
    }
  });

  it("documents the line-coverage tiers", () => {
    renderPage();
    expect(screen.getByText(/95%/)).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
    expect(screen.getByText(/70%/)).toBeInTheDocument();
  });
});
