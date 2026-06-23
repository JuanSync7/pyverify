import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PipelinePage } from "./PipelinePage";

function renderPage() {
  return render(
    <MemoryRouter>
      <PipelinePage />
    </MemoryRouter>
  );
}

describe("PipelinePage", () => {
  it("shows the pipeline diagram", () => {
    renderPage();
    expect(screen.getAllByText(/START →/).length).toBeGreaterThan(0);
  });

  it("explains the bounded audit-generate loop", () => {
    renderPage();
    expect(screen.getAllByText(/loop/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/max_cycles/).length).toBeGreaterThan(0);
  });

  it("explains per-stage human gates", () => {
    renderPage();
    expect(screen.getAllByText(/interrupt/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/gate/i).length).toBeGreaterThan(0);
  });

  it("links each step to its detail page", () => {
    renderPage();
    const gen = screen.getByRole("link", { name: /generate/i });
    expect(gen).toHaveAttribute("href", "/steps/generate");
  });
});
