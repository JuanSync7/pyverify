import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StartPage } from "./StartPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <StartPage />
    </MemoryRouter>
  );
}

describe("StartPage", () => {
  it("shows the install command", () => {
    renderPage();
    expect(screen.getByText(/uv sync/)).toBeInTheDocument();
  });

  it("shows how to run a verification and resume a gate", () => {
    renderPage();
    expect(screen.getAllByText(/pyverify run/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/--yes/).length).toBeGreaterThan(0);
  });

  it("documents the vendored-tools sync step", () => {
    renderPage();
    expect(screen.getByText(/sync-vendor/)).toBeInTheDocument();
  });

  it("shows how to serve the dashboard", () => {
    renderPage();
    expect(screen.getAllByText(/pyverify serve|run_demo/).length).toBeGreaterThan(0);
  });
});
