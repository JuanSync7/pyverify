import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToolsPage } from "./ToolsPage";
import { TOOLS } from "../wiki/content";

function renderPage() {
  return render(
    <MemoryRouter>
      <ToolsPage />
    </MemoryRouter>
  );
}

describe("ToolsPage", () => {
  it("lists every deterministic tool", () => {
    renderPage();
    const table = screen.getByTestId("tool-table");
    for (const t of TOOLS) {
      expect(within(table).getByText(t.name)).toBeInTheDocument();
    }
  });

  it("explains what the mutation runner measures", () => {
    renderPage();
    expect(screen.getByText(/kill-rate/i)).toBeInTheDocument();
  });

  it("documents the exit-code convention", () => {
    renderPage();
    expect(screen.getAllByText(/exit code|exit-code|return code/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/findings|tool error/i).length).toBeGreaterThan(0);
  });
});
