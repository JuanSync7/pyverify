import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { WikiLayout } from "./WikiLayout";

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<WikiLayout />}>
          <Route index element={<div>OUTLET CONTENT</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("WikiLayout", () => {
  it("renders the brand and the page (outlet)", () => {
    renderLayout();
    expect(screen.getByRole("link", { name: "pyverify" })).toBeInTheDocument();
    expect(screen.getByText("OUTLET CONTENT")).toBeInTheDocument();
  });

  it("renders all sidebar sections and key destinations", () => {
    renderLayout();
    for (const section of ["Start here", "Understand", "Reference", "Try it"]) {
      expect(screen.getByText(section)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Deterministic tools" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Playground" })).toBeInTheDocument();
  });

  it("links to the GitHub repo", () => {
    renderLayout();
    const gh = screen.getByRole("link", { name: /GitHub/ });
    expect(gh).toHaveAttribute("href", expect.stringContaining("github.com"));
  });
});
