import { useQuery } from "@tanstack/react-query";
import type { TaxBracket, TaxBracketsResponse, TaxYear } from "@/types/tax";
import { getApiBaseUrl } from "@/utils/envUtils";
import { logger } from "@/utils/logger";
import { statusToError } from "@/errors/statusToError";
import { APIError } from "@/errors/APIError";

/**
 * Fetches tax brackets for a given year
 */
const fetchTaxBrackets = async (year?: TaxYear): Promise<TaxBracket[]> => {
  if (!year) {
    return [];
  }

  // These logs should also be present in the backend
  // There could be scenarios where network is inreacheable, or the server is down, etc
  // Where these logs would be useful.
  logger.info(`[TaxFetch] Fetching tax brackets for year ${year}`);

  const response = await fetch(
    `${getApiBaseUrl()}/tax-calculator/tax-year/${year}`
  );

  if (!response.ok) {
    const error = statusToError(response.status);

    // Log unexpected errors so they'are investigated later on.
    if (error.status === 500) {
      logger.error(`[TaxFetch] Failed for year ${year}`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }

    throw error;
  }

  logger.info(`[TaxFetch] Successfully fetched tax brackets for year ${year}`);

  const data: TaxBracketsResponse = await response.json();
  return data.tax_brackets;
};

const useTaxBrackets = (year?: TaxYear) => {
  return useQuery({
    queryKey: ["taxBrackets", year],
    queryFn: () => fetchTaxBrackets(year),
    enabled: !!year,
    retry: (failureCount, error) => {
      // If error is a 404, we don't want to retry.
      if (error instanceof APIError && error.status === 404) return false;
      logger.warn(
        `[TaxFetch] RETRYING fetching tax brackets for year ${year}, failure count: [${
          failureCount + 1
        }]`
      );
      return failureCount < 3;
    },
  });
};

export { useTaxBrackets };
