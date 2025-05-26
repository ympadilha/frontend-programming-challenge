import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaxBreakdown } from ".";
import type { TaxCalculationResult } from "@/types/tax";

describe("TaxBreakdown", () => {
  it("renders nothing when taxPerBracket is empty", () => {
    const { container } = render(<TaxBreakdown taxPerBracket={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders table with correct headers", () => {
    const taxPerBracket: TaxCalculationResult["taxPerBracket"] = [
      {
        bracket: { min: 0, max: 50197, rate: 0.15 },
        taxableIncome: 50197,
        taxOwed: 7529.55,
      },
    ];

    render(<TaxBreakdown taxPerBracket={taxPerBracket} />);

    expect(screen.getByText("Tax Breakdown by Bracket")).toBeInTheDocument();
    expect(screen.getByText("Tax Bracket")).toBeInTheDocument();
    expect(screen.getByText("Rate")).toBeInTheDocument();
    expect(screen.getByText("Taxable Income")).toBeInTheDocument();
    expect(screen.getByText("Tax Owed")).toBeInTheDocument();
  });

  it("renders tax brackets correctly", () => {
    const taxPerBracket: TaxCalculationResult["taxPerBracket"] = [
      {
        bracket: { min: 0, max: 50197, rate: 0.15 },
        taxableIncome: 50197,
        taxOwed: 7529.55,
      },
      {
        bracket: { min: 50197, max: 100392, rate: 0.205 },
        taxableIncome: 49803,
        taxOwed: 10209.62,
      },
      {
        bracket: { min: 100392, max: 155625, rate: 0.26 },
        taxableIncome: 55233,
        taxOwed: 14360.58,
      },
    ];

    render(<TaxBreakdown taxPerBracket={taxPerBracket} />);

    // Check all bracket ranges using regex
    expect(screen.getByText("$0.00 - $50,197.00")).toBeInTheDocument();
    expect(screen.getByText("$50,197.00 - $100,392.00")).toBeInTheDocument();
    expect(screen.getByText("$100,392.00 - $155,625.00")).toBeInTheDocument();

    // Check all rates
    expect(screen.getByText("15.00%")).toBeInTheDocument();
    expect(screen.getByText("20.50%")).toBeInTheDocument();
    expect(screen.getByText("26.00%")).toBeInTheDocument();

    // Check all taxable incomes
    expect(screen.getByText("$50,197.00")).toBeInTheDocument();
    expect(screen.getByText("$49,803.00")).toBeInTheDocument();
    expect(screen.getByText("$55,233.00")).toBeInTheDocument();

    // Check all tax owed amounts
    expect(screen.getByText("$7,529.55")).toBeInTheDocument();
    expect(screen.getByText("$10,209.62")).toBeInTheDocument();
    expect(screen.getByText("$14,360.58")).toBeInTheDocument();
  });

  it("handles highest bracket without max value (shows 'and above')", () => {
    const taxPerBracket: TaxCalculationResult["taxPerBracket"] = [
      {
        bracket: { min: 0, max: 50197, rate: 0.15 },
        taxableIncome: 50197,
        taxOwed: 7529.55,
      },
      {
        bracket: { min: 221708, rate: 0.33 }, // No max value
        taxableIncome: 1012859,
        taxOwed: 334243.47,
      },
    ];

    render(<TaxBreakdown taxPerBracket={taxPerBracket} />);

    // Check that highest bracket shows "and above" using regex
    expect(screen.getByText("$221,708.00 - and above")).toBeInTheDocument();
    expect(screen.getByText("33.00%")).toBeInTheDocument();
    expect(screen.getByText("$1,012,859.00")).toBeInTheDocument();
    expect(screen.getByText("$334,243.47")).toBeInTheDocument();
  });

  it("handles zero values correctly", () => {
    const taxPerBracket: TaxCalculationResult["taxPerBracket"] = [
      {
        bracket: { min: 0, max: 1000, rate: 0 }, // Use a non-zero max to test the rendering
        taxableIncome: 0,
        taxOwed: 0,
      },
    ];

    render(<TaxBreakdown taxPerBracket={taxPerBracket} />);

    expect(screen.getByText("$0.00 - $1,000.00")).toBeInTheDocument();
    expect(screen.getByText("0.00%")).toBeInTheDocument();
    expect(screen.getAllByText("$0.00")).toHaveLength(2); // taxable income and tax owed
  });
});
