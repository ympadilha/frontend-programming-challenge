export interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
}

export interface TaxBracketsResponse {
  tax_brackets: TaxBracket[];
}

export interface TaxCalculationResult {
  totalTax: number;
  effectiveRate: number;
  taxPerBracket: {
    bracket: TaxBracket;
    taxableIncome: number;
    taxOwed: number;
  }[];
}

// TODO: This is not very extensible, will need to improve
export type TaxYear = 2019 | 2020 | 2021 | 2022;
