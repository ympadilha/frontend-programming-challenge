import "./TaxBreakdown.css";
import type { TaxCalculationResult } from "@/types/tax";
import { formatCurrency } from "@/utils/format";

interface TaxBreakdownProps {
  taxPerBracket: TaxCalculationResult["taxPerBracket"];
}

const formatPercent = (rate: number) => {
  return `${rate.toFixed(2)}%`;
};

export function TaxBreakdown({ taxPerBracket }: TaxBreakdownProps) {
  if (taxPerBracket.length === 0) {
    return null;
  }

  return (
    <section className="tax-breakdown">
      <h3>Tax Breakdown by Bracket</h3>
      <div className="bracket-table">
        <table className="tax-table">
          <thead>
            <tr className="table-header">
              <th>Tax Bracket</th>
              <th>Rate</th>
              <th>Taxable Income</th>
              <th>Tax Owed</th>
            </tr>
          </thead>
          <tbody>
            {taxPerBracket.map((item, index) => (
              <tr key={index} className="table-row">
                <td className="bracket-range">
                  {formatCurrency(item.bracket.min)} -{" "}
                  {item.bracket.max
                    ? formatCurrency(item.bracket.max)
                    : "and above"}
                </td>
                <td className="rate">
                  {formatPercent(item.bracket.rate * 100)}
                </td>
                <td className="taxable-income">
                  {formatCurrency(item.taxableIncome)}
                </td>
                <td className="tax-owed">{formatCurrency(item.taxOwed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
