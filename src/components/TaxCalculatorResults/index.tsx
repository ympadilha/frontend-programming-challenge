import "./TaxCalculatorResults.css";
import { TaxBreakdown } from "@/components/TaxBreakdown";
import type { TaxCalculationResult } from "@/types/tax";
import { formatCurrency } from "@/utils/format";

interface TaxCalculatorResultsProps {
  result: TaxCalculationResult;
  income: number;
  year: number;
}

const formatPercent = (rate: number) => {
  return `${rate.toFixed(2)}%`;
};

export function TaxCalculatorResults({
  result,
  income,
  year,
}: TaxCalculatorResultsProps) {
  return (
    <div className="tax-results">
      <h2>Tax Calculation Results for {year}</h2>

      <div className="summary-card">
        <div className="summary-item">
          <label>Annual Income:</label>
          <span className="value">{formatCurrency(income)}</span>
        </div>

        <div className="summary-item">
          <label>Total Income Tax:</label>
          <span className="value total-tax">
            {formatCurrency(result.totalTax)}
          </span>
        </div>

        <div className="summary-item">
          <label>Effective Tax Rate:</label>
          <span className="value">{formatPercent(result.effectiveRate)}</span>
        </div>

        <div className="summary-item">
          <label>After-Tax Income:</label>
          <span className="value">
            {formatCurrency(income - result.totalTax)}
          </span>
        </div>
      </div>

      <TaxBreakdown taxPerBracket={result.taxPerBracket} />
    </div>
  );
}
