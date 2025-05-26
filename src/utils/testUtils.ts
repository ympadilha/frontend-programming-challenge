import type { TaxBracketsResponse } from "@/types/tax";
import { QueryClient } from "@tanstack/react-query";
import { vi } from "vitest";

const TIMEOUT = { timeout: 500 };

// Super fast retries for testing
const FAST_RESPONSE_MOCK_QUERY_CLIENT = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: () => 10,
      },
    },
  });

const MOCK_API_RESPONSE: TaxBracketsResponse = {
  tax_brackets: [
    { min: 0, max: 10000, rate: 0.1 },
    { min: 10000, max: 20000, rate: 0.2 },
  ],
};

const RESPONSE_404 = () => ({
  ok: false,
  status: 404,
  statusText: "Not Found",
});

const RESPONSE_500 = () => ({
  ok: false,
  status: 500,
  statusText: "Internal Server Error",
});

const RESPONSE_200 = (mockApiResponse: TaxBracketsResponse) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue(mockApiResponse),
});

export {
  TIMEOUT,
  MOCK_API_RESPONSE,
  RESPONSE_200,
  RESPONSE_404,
  RESPONSE_500,
  FAST_RESPONSE_MOCK_QUERY_CLIENT,
};
