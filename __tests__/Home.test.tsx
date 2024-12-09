import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "../app/page";

import { aiResponse } from "../app/actions";

vi.mock("../app/actions", () => ({
  aiResponse: vi.fn(),
}));

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

  it("disables the button and shows loading state when form is submitted", async () => {
    vi.mocked(aiResponse).mockResolvedValue("Mocked response");

    render(<Home />);
    const input = screen.getByPlaceholderText("Enter your prompt here");
    const button = screen.getByRole("button", { name: "Compare" });

    fireEvent.change(input, { target: { value: "Test prompt" } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Generating...");

    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent("Compare");
    });
  });
});
