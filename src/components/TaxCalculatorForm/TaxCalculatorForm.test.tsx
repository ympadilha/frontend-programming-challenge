import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaxCalculatorForm } from ".";

describe("TaxCalculatorForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/annual income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tax year/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculate tax/i })
    ).toBeInTheDocument();
  });

  it("displays income input with correct placeholder", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    expect(incomeInput).toHaveAttribute(
      "placeholder",
      "Enter your annual income (e.g., 50,000)"
    );
  });

  it("has default tax year of 2022", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const yearSelect = screen.getByLabelText(/tax year/i) as HTMLSelectElement;
    expect(yearSelect.value).toBe("2022");
  });

  it("formats income input with commas", async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);

    await user.type(incomeInput, "123456");
    expect(incomeInput).toHaveValue("123,456");
  });

  it("handles decimal values correctly", async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);

    await user.type(incomeInput, "50000.50");
    expect(incomeInput).toHaveValue("50,000.50");
  });

  it("removes non-numeric characters except decimal", async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);

    await user.type(incomeInput, "abc123def.45ghi");
    expect(incomeInput).toHaveValue("123.45");
  });

  it("submits form with correct values", async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const yearSelect = screen.getByLabelText(/tax year/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "50000");
    await user.selectOptions(yearSelect, "2021");
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(50000, 2021);
  });

  it("handles commas in input when submitting", async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "1234567");
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(1234567, 2022);
  });

  it("disables form when loading", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={true} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const yearSelect = screen.getByLabelText(/tax year/i);
    const submitButton = screen.getByRole("button", { name: /calculating/i });

    expect(incomeInput).toBeDisabled();
    expect(yearSelect).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("shows calculating text when loading", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(
      screen.getByRole("button", { name: /calculating/i })
    ).toBeInTheDocument();
  });

  it("disables submit button when income is empty", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole("button", { name: /calculate tax/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when income is provided", async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole("button", { name: /calculate tax/i });

    await user.type(incomeInput, "50000");
    expect(submitButton).toBeEnabled();
  });

  it("includes all tax year options", () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const yearSelect = screen.getByLabelText(/tax year/i);
    const options = Array.from(yearSelect.querySelectorAll("option")).map(
      (option) => option.value
    );

    expect(options).toEqual(["2019", "2020", "2021", "2022"]);
  });

  it("prevents form submission when enter is pressed with invalid data", async () => {
    const user = userEvent.setup();

    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);

    // Type a valid number first, then make it invalid
    await user.type(incomeInput, "50000");
    await user.clear(incomeInput);
    await user.type(incomeInput, "..");
    await user.keyboard("{Enter}");

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
