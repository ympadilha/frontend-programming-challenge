import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { TaxCalculatorForm } from "@/components/TaxCalculatorForm";
import { TaxCalculatorResults } from "@/components/TaxCalculatorResults";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { TaxYear } from "@/types/tax";
import { useTaxBrackets } from "@/hooks/useTaxBrackets";
import { calculateTax } from "@/services/taxCalculator";

export interface CalculationParams {
  income: number;
  year: TaxYear;
}

function App() {
  const [calculationParams, setCalculationParams] =
    useState<CalculationParams | null>(null);

  const {
    data: brackets,
    isLoading,
    error,
  } = useTaxBrackets(calculationParams?.year);

  const result = useMemo(() => {
    const income = calculationParams?.income;

    if (!brackets || income == null) {
      return null;
    }

    return calculateTax(income, brackets);
  }, [calculationParams?.income, brackets]);

  const handleCalculateTax = useCallback(
    (income: number, year: TaxYear) => {
      setCalculationParams({ income, year });
    },
    [setCalculationParams]
  );

  const handleResetCalculation = () => {
    setCalculationParams(null);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>Tax Calculator</h1>
          <p>
            Calculate your income tax based on Canadian federal tax brackets
          </p>
        </header>

        <main className="app-main">
          {error && (
            <ErrorMessage
              error={error.message}
              onDismiss={handleResetCalculation}
            />
          )}

          <TaxCalculatorForm
            onSubmit={handleCalculateTax}
            isLoading={isLoading}
          />

          {result && calculationParams && (
            <>
              <TaxCalculatorResults
                result={result}
                income={calculationParams.income}
                year={calculationParams.year}
              />

              <div className="new-calculation">
                <button
                  onClick={handleResetCalculation}
                  className="new-calculation-button"
                >
                  Calculate for Different Income/Year
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
