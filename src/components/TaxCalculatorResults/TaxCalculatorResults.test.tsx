import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaxCalculatorResults } from ".";
import type { TaxCalculationResult } from "@/types/tax";

describe("TaxCalculatorResults", () => {
  it("renders tax calculation results correctly", () => {
    const multiResult: TaxCalculationResult = {
      totalTax: 17739.17,
      effectiveRate: 17.74,
      taxPerBracket: [
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
      ],
    };

    render(
      <TaxCalculatorResults result={multiResult} income={100000} year={2022} />
    );

    expect(screen.getByText("$100,000.00")).toBeInTheDocument();
    expect(screen.getByText("$17,739.17")).toBeInTheDocument();
    expect(screen.getByText("17.74%")).toBeInTheDocument();
    expect(screen.getByText("$82,260.83")).toBeInTheDocument();

    // Bracket[0]
    expect(screen.getByText("$0.00 - $50,197.00")).toBeInTheDocument();
    // Rate
    expect(screen.getByText("15.00%")).toBeInTheDocument();
    // Taxable income
    expect(screen.getByText("$50,197.00")).toBeInTheDocument();
    // Tax owed
    expect(screen.getByText("$7,529.55")).toBeInTheDocument();

    // Bracket[1]
    expect(screen.getByText("$50,197.00 - $100,392.00")).toBeInTheDocument();
    // Rate
    expect(screen.getByText("20.50%")).toBeInTheDocument();
    // Taxable income
    expect(screen.getByText("$49,803.00")).toBeInTheDocument();
    // Tax owed
    expect(screen.getByText("$10,209.62")).toBeInTheDocument();
  });

  it("handles highest tax bracket without max value", () => {
    const highIncomeResult: TaxCalculationResult = {
      totalTax: 385587.65,
      effectiveRate: 31.23,
      taxPerBracket: [
        {
          bracket: { min: 0, max: 50197, rate: 0.15 },
          taxableIncome: 50197,
          taxOwed: 7529.55,
        },
        {
          bracket: { min: 221708, rate: 0.33 },
          taxableIncome: 1012859,
          taxOwed: 334243.47,
        },
      ],
    };

    render(
      <TaxCalculatorResults
        result={highIncomeResult}
        income={1234567}
        year={2022}
      />
    );

    expect(screen.getByText("$221,708.00 - and above")).toBeInTheDocument();
  });

  it("does not show breakdown when no brackets exist", () => {
    const emptyResult: TaxCalculationResult = {
      totalTax: 0,
      effectiveRate: 0,
      taxPerBracket: [],
    };

    render(
      <TaxCalculatorResults result={emptyResult} income={0} year={2022} />
    );

    expect(
      screen.queryByText("Tax Breakdown by Bracket")
    ).not.toBeInTheDocument();
  });

  it("handles zero tax correctly", () => {
    const zeroResult: TaxCalculationResult = {
      totalTax: 0,
      effectiveRate: 0,
      taxPerBracket: [],
    };

    render(<TaxCalculatorResults result={zeroResult} income={0} year={2022} />);

    expect(screen.getAllByText("$0.00")).toHaveLength(3); // Income, tax, after-tax
    expect(screen.getByText("0.00%")).toBeInTheDocument();
  });
});
