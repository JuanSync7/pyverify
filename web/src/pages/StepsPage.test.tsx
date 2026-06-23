import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StepsPage } from "./StepsPage";
import { STEPS } from "../wiki/content";

function at(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/steps" element={<StepsPage />} />
        <Route path="/steps/:stepId" element={<StepsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("StepsPage", () => {
  it("lists all seven steps on the index", () => {
    at("/steps");
    const list = screen.getByTestId("step-index");
    for (const s of STEPS) {
      expect(within(list).getByRole("link", { name: new RegExp(`^${s.name}`, "i") })).toBeInTheDocument();
    }
  });

  it("renders a step detail with its tools and gate", () => {
    at("/steps/generate");
    expect(screen.getByRole("heading", { level: 1, name: /generate/i })).toBeInTheDocument();
    expect(screen.getByText("mutation_runner")).toBeInTheDocument();
    expect(screen.getByText(/human gate/i)).toBeInTheDocument();
  });

  it("shows audit as a deterministic step", () => {
    at("/steps/audit");
    expect(screen.getAllByText(/deterministic/i).length).toBeGreaterThan(0);
  });

  it("handles an unknown step id gracefully", () => {
    at("/steps/nope");
    expect(screen.getByText(/unknown step/i)).toBeInTheDocument();
  });
});
