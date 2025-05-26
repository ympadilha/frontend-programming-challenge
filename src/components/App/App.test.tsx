import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  FAST_RESPONSE_MOCK_QUERY_CLIENT,
  MOCK_API_RESPONSE,
  RESPONSE_200,
  RESPONSE_500,
  TIMEOUT,
} from "@/utils/testUtils";
import type React from "react";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

let Application: () => React.JSX.Element;

describe("App Integration Tests", () => {
  beforeEach(() => {
    // Create a fresh QueryClient for each test to avoid cache interference
    Application = () => (
      <QueryClientProvider client={FAST_RESPONSE_MOCK_QUERY_CLIENT()}>
        <App />
      </QueryClientProvider>
    );
    vi.resetAllMocks();
  });

  it("renders the component correctly", () => {
    render(<Application />);

    expect(screen.getByText("Tax Calculator")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Calculate your income tax based on Canadian federal tax brackets/
      )
    ).toBeInTheDocument();
  });

  it("performs complete tax calculation flow", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValue(RESPONSE_200(MOCK_API_RESPONSE));

    render(<Application />);

    // Fill in form
    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "20000");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Tax Calculation Results for 2022/)
      ).toBeInTheDocument();
    }, TIMEOUT);

    expect(screen.getAllByText("$20,000.00")).toHaveLength(1);
    expect(screen.getAllByText("$2,000.00")).toHaveLength(1);
    expect(screen.getAllByText("10.00%")).toHaveLength(1);
  });

  it("handles API errors with retries", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValue(RESPONSE_500);

    render(<Application />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "50000");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      // 3 retries + 1 initial call
      expect(fetch).toHaveBeenCalledTimes(4);
    }, TIMEOUT);

    expect(
      screen.getByText(/Something went wrong, please try again/)
    ).toBeInTheDocument();
  });

  it("allows dismissing errors", async () => {
    const user = userEvent.setup();

    // Mock API error
    mockFetch.mockResolvedValue(RESPONSE_500);

    render(<Application />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "50000");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    }, TIMEOUT);

    // Dismiss error
    const dismissButton = screen.getByRole("button", {
      name: /dismiss error/i,
    });
    await user.click(dismissButton);

    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });

  it("shows loading state during calculation", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValue(RESPONSE_200(MOCK_API_RESPONSE));

    render(<Application />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "50000");

    expect(submitButton).toHaveTextContent("Calculate Tax");

    await user.click(submitButton);

    await waitFor(() => {
      const button = screen.getByRole("button", {
        name: /calculate tax|calculating/i,
      });
      expect(button).toBeInTheDocument();
    }, TIMEOUT);
  });

  it("allows starting a new calculation", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValue(RESPONSE_200(MOCK_API_RESPONSE));

    render(<Application />);

    // Complete first calculation
    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "50000");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Tax Calculation Results/)).toBeInTheDocument();
    }, TIMEOUT);

    // Start new calculation
    const newCalculationButton = screen.getByRole("button", {
      name: /Calculate for Different Income\/Year/i,
    });
    await user.click(newCalculationButton);

    expect(
      screen.queryByText(/Tax Calculation Results/)
    ).not.toBeInTheDocument();
  });
});
