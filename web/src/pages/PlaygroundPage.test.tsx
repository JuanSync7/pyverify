import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlaygroundPage } from "./PlaygroundPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <PlaygroundPage />
    </MemoryRouter>
  );
}

describe("PlaygroundPage", () => {
  it("has a playground heading and a how-to-read tour", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: /playground/i })).toBeInTheDocument();
    expect(screen.getByText(/how to read it/i)).toBeInTheDocument();
    expect(screen.getByText(/dimension cards/i)).toBeInTheDocument();
  });

  it("embeds the real dashboard app", () => {
    renderPage();
    // The dashboard's own tagline proves the App component is mounted inside.
    expect(screen.getAllByText(/multi-dimensional test coverage/i).length).toBeGreaterThan(0);
  });
});
