import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StackPage } from "./StackPage";
import { PACKAGES, PACKAGE_GROUPS } from "../wiki/content";

function renderPage() {
  return render(
    <MemoryRouter>
      <StackPage />
    </MemoryRouter>
  );
}

describe("StackPage", () => {
  it("highlights every package as its own card", () => {
    renderPage();
    for (const p of PACKAGES) {
      expect(screen.getByRole("heading", { level: 3, name: p.name })).toBeInTheDocument();
    }
    // exactly one card per package — no stray/missing entries
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(PACKAGES.length);
  });

  it("names every layer (group title) as a section heading", () => {
    renderPage();
    for (const g of PACKAGE_GROUPS) {
      expect(screen.getByRole("heading", { level: 2, name: g.title })).toBeInTheDocument();
    }
  });

  it("frames the model layer as optional and pluggable, not vendor-locked", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 2, name: "Model layer" })).toBeInTheDocument();
    expect(screen.getAllByText(/pluggable|model-agnostic|new backend, not a rewrite/i).length)
      .toBeGreaterThan(0);
  });

  it("is honest that pyverdex vendors its own mutation + secret tools", () => {
    renderPage();
    expect(screen.getByText(/mutmut/)).toBeInTheDocument();
    expect(screen.getByText(/detect-secrets/)).toBeInTheDocument();
    expect(screen.getAllByText(/custom AST|reproducible|its own/i).length).toBeGreaterThan(0);
  });
});
