import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateTax } from "@/services/taxCalculator";
import type { TaxBracket } from "@/types/tax";

// Mock 2022 tax brackets from the assignment
const mockTaxBrackets2022: TaxBracket[] = [
  {
    min: 0,
    max: 50197,
    rate: 0.15,
  },
  {
    min: 50197,
    max: 100392,
    rate: 0.205,
  },
  {
    min: 100392,
    max: 155625,
    rate: 0.26,
  },
  {
    min: 155625,
    max: 221708,
    rate: 0.29,
  },
  {
    min: 221708,
    rate: 0.33,
  },
];

describe("calculateTax", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should calculate $0 tax for $0 income", async () => {
    const result = calculateTax(0, mockTaxBrackets2022);

    expect(result.totalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.taxPerBracket).toHaveLength(0);
  });

  it("should treat negative income as $0", async () => {
    const result = calculateTax(-1000, mockTaxBrackets2022);

    expect(result.totalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.taxPerBracket).toHaveLength(0);
  });

  it("should handle unsorted tax brackets and return correct results", async () => {
    const unsortedBrackets = [...mockTaxBrackets2022].reverse();
    const result = calculateTax(50000, unsortedBrackets);

    expect(result.totalTax).toBeCloseTo(7500.0, 2);
    expect(result.effectiveRate).toBeCloseTo(15.0, 2);
  });

  it("should calculate $385,587.65 tax for $1,234,567 income", async () => {
    const { totalTax, effectiveRate, taxPerBracket } = calculateTax(
      1234567,
      mockTaxBrackets2022
    );

    expect(totalTax).toBe(385587.65);
    expect(effectiveRate).toBe(31.23);
    expect(taxPerBracket).toHaveLength(5);
    expect(taxPerBracket[0].taxableIncome).toBe(50197);
    expect(taxPerBracket[0].taxOwed).toBe(7529.55);

    expect(taxPerBracket[1].taxableIncome).toBe(50195);
    expect(taxPerBracket[1].taxOwed).toBe(10289.97);

    expect(taxPerBracket[2].taxableIncome).toBe(55233);
    expect(taxPerBracket[2].taxOwed).toBe(14360.58);

    expect(taxPerBracket[3].taxableIncome).toBe(66083);
    expect(taxPerBracket[3].taxOwed).toBe(19164.07);

    expect(taxPerBracket[4].taxableIncome).toBe(1012859);
    expect(taxPerBracket[4].taxOwed).toBe(334243.47);
  });
});
