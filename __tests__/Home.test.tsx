import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Home from "../app/page";

import { aiResponse } from "../app/actions";

vi.mock("../app/actions", () => ({
  aiResponse: vi.fn(),
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("displays responses when the form is submitted", async () => {
    vi.mocked(aiResponse).mockImplementation((prompt, model) =>
      Promise.resolve(`Response for ${model}: ${prompt}`)
    );
    render(<Home />);
    const input = screen.getByPlaceholderText("Enter your prompt here");
    const button = screen.getByRole("button", { name: "Compare" });

    fireEvent.change(input, { target: { value: "Test prompt" } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByText("Response for gpt-3.5-turbo: Test prompt")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Response for gpt-4: Test prompt")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Response for gpt-4-turbo: Test prompt")
      ).toBeInTheDocument();
    });
  });

  it("handles errors gracefully", async () => {
    const errorMessage = "API Error Message";
    vi.mocked(aiResponse).mockRejectedValue(new Error(errorMessage));

    render(<Home />);
    const input = screen.getByPlaceholderText("Enter your prompt here");
    const button = screen.getByRole("button", { name: "Compare" });

    fireEvent.change(input, { target: { value: "Test prompt" } });
    fireEvent.click(button);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Error");
      expect(alert).toHaveTextContent(errorMessage);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Compare");

    const noResponseTexts = screen.getAllByText("No response generated yet.");
    expect(noResponseTexts).toHaveLength(3);

    expect(aiResponse).toHaveBeenCalledTimes(3);
  });

  it("clears error when form is submitted again", async () => {
    const errorMessage = "API Error Message";
    vi.mocked(aiResponse)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValue("Mocked response");

    render(<Home />);

    const input = screen.getByPlaceholderText("Enter your prompt here");
    const button = screen.getByRole("button", { name: "Compare" });

    fireEvent.change(input, { target: { value: "Test prompt" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    fireEvent.change(input, { target: { value: "Test prompt" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
