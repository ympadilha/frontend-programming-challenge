import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorMessage } from ".";

describe("ErrorMessage", () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error message correctly", () => {
    const errorText = "Something went wrong!";

    render(<ErrorMessage error={errorText} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText(errorText)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /dismiss error/i })
    ).toBeInTheDocument();
  });

  it("displays error icon", () => {
    render(<ErrorMessage error="Test error" onDismiss={mockOnDismiss} />);

    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked", async () => {
    const user = userEvent.setup();

    render(<ErrorMessage error="Test error" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByRole("button", {
      name: /dismiss error/i,
    });
    await user.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("displays different error messages", () => {
    const { rerender } = render(
      <ErrorMessage error="First error" onDismiss={mockOnDismiss} />
    );

    expect(screen.getByText("First error")).toBeInTheDocument();

    rerender(<ErrorMessage error="Second error" onDismiss={mockOnDismiss} />);

    expect(screen.queryByText("First error")).not.toBeInTheDocument();
    expect(screen.getByText("Second error")).toBeInTheDocument();
  });
});
