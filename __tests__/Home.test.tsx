import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("Home page", () => {
  it("renders the home page component correctly", () => {
    render(<Home />);

    expect(screen.getByText("OpenAi Model Comparison")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your prompt here")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compare" })).toBeInTheDocument();

    const modelCards = screen.getAllByRole("heading", { level: 2 });

    expect(modelCards.length).toBe(3);
    expect(modelCards[0]).toHaveTextContent("gpt-3.5-turbo says:");
    expect(modelCards[1]).toHaveTextContent("gpt-4 says:");
    expect(modelCards[2]).toHaveTextContent("gpt-4-turbo says:");
  });
});
