import { useState } from "react";
import "./TaxCalculatorForm.css";
import type { TaxYear } from "@/types/tax";

interface TaxCalculatorFormProps {
  onSubmit: (income: number, year: TaxYear) => void;
  isLoading: boolean;
}

export function TaxCalculatorForm({
  onSubmit,
  isLoading,
}: TaxCalculatorFormProps) {
  const [income, setIncome] = useState<string>("");
  const [year, setYear] = useState<TaxYear>(2022);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericIncome = parseFloat(income.replace(/,/g, ""));

    if (isNaN(numericIncome) || numericIncome < 0) {
      // show error msg for user feedback,
      // but still, this shouldn't happen if JS is working
      return;
    }

    onSubmit(numericIncome, year);
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Add commas for thousands separator
    if (numericValue) {
      const parts = numericValue.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    return numericValue;
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setIncome(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="tax-calculator-form">
      <div className="form-group">
        <label htmlFor="income">Annual Income ($)</label>
        <input
          type="text"
          id="income"
          value={income}
          onChange={handleIncomeChange}
          placeholder="Enter your annual income (e.g., 50,000)"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="year">Tax Year</label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value) as TaxYear)}
          disabled={isLoading}
        >
          <option value="2019">2019</option>
          <option value="2020">2020</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !income.trim()}
        className="submit-button"
      >
        {isLoading ? "Calculating..." : "Calculate Tax"}
      </button>
    </form>
  );
}
