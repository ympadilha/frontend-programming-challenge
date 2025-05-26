import type { TaxBracket, TaxCalculationResult } from "@/types/tax";

/**
 * Calculates tax based on income and tax brackets
 */
const calculateTax = (
  income: number,
  brackets: TaxBracket[]
): TaxCalculationResult => {
  if (income <= 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      taxPerBracket: [],
    };
  }

  let totalTax = 0;
  let remainingIncome = income;
  const taxPerBracket: TaxCalculationResult["taxPerBracket"] = [];

  // Sort brackets by min value to ensure correct calculation
  const sortedBrackets = [...brackets].sort((a, b) => a.min - b.min);

  for (const bracket of sortedBrackets) {
    if (remainingIncome <= 0) break;

    // Calculate taxable income for this bracket
    const bracketMin = bracket.min;
    const bracketMax = bracket.max || Number.MAX_SAFE_INTEGER;

    // Only tax income above the bracket minimum
    if (income <= bracketMin) continue;

    // Calculate how much income falls in this bracket
    const incomeInBracket = Math.min(income, bracketMax) - bracketMin;
    const taxableInThisBracket = Math.min(incomeInBracket, remainingIncome);

    if (taxableInThisBracket > 0) {
      const taxOwed = taxableInThisBracket * bracket.rate;
      totalTax += taxOwed;

      taxPerBracket.push({
        bracket,
        taxableIncome: taxableInThisBracket,
        taxOwed: roundToTwoDecimalPlaces(taxOwed),
      });

      remainingIncome -= taxableInThisBracket;
    }
  }

  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    totalTax: roundToTwoDecimalPlaces(totalTax),
    // Convert to percentage with 2 decimals
    effectiveRate: Math.round(effectiveRate * 10000) / 100,
    taxPerBracket,
  };
};

/**
 * Reference regarding rounding the values
 * https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4022/general-information-gst-hst-registrants.html#H2_221
 */
const roundToTwoDecimalPlaces = (value: number) =>
  Math.round(value * 100) / 100;

export { calculateTax };
