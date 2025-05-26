import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTaxBrackets } from "./useTaxBrackets";
import { NotFoundError } from "@/errors/NotFoundError";
import { InternalServerError } from "@/errors/InternalServerError";
import type { TaxYear } from "@/types/tax";
import {
  FAST_RESPONSE_MOCK_QUERY_CLIENT,
  MOCK_API_RESPONSE,
  RESPONSE_200,
  RESPONSE_404,
  RESPONSE_500,
  TIMEOUT,
} from "@/utils/testUtils";

vi.mock("@/utils/envUtils", () => ({
  getApiBaseUrl: vi.fn(() => "http://localhost:5001"),
}));

vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useTaxBrackets", () => {
  let queryClient: QueryClient;

  const renderHookWithClient = (year?: TaxYear) => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );

    return renderHook(() => useTaxBrackets(year), { wrapper });
  };

  beforeEach(() => {
    // Create a fresh QueryClient for each test to avoid cache interference
    queryClient = FAST_RESPONSE_MOCK_QUERY_CLIENT();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("successful API calls", () => {
    it("should fetch tax brackets successfully for a valid year", async () => {
      mockFetch.mockResolvedValue(RESPONSE_200(MOCK_API_RESPONSE));

      const { result } = renderHookWithClient(2022);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, TIMEOUT);

      expect(result.current.data).toEqual(MOCK_API_RESPONSE.tax_brackets);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:5001/tax-calculator/tax-year/2022"
      );
    });
  });

  describe("when year is not provided", () => {
    it("should not make API call when year is undefined", () => {
      const { result } = renderHookWithClient(undefined);
      expect(result.current.data).toBeUndefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("API error handling", () => {
    it("should handle 404 errors correctly", async () => {
      mockFetch.mockResolvedValue(RESPONSE_404());

      const { result } = renderHookWithClient(2025 as TaxYear);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, TIMEOUT);

      expect(result.current.error).toBeInstanceOf(NotFoundError);
      expect(result.current.error?.message).toBe("Not found");
      expect(result.current.data).toBeUndefined();
    });

    it("should handle 500 errors and log them", async () => {
      mockFetch.mockResolvedValue(RESPONSE_500());

      const { result } = renderHookWithClient(2022);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, TIMEOUT);

      expect(result.current.error).toBeInstanceOf(InternalServerError);
      expect(result.current.error?.message).toBe(
        "Something went wrong, please try again"
      );

      // Verify logging was called for 500 errors
      const { logger } = await import("@/utils/logger");
      expect(logger.error).toHaveBeenCalledWith(
        "[TaxFetch] Failed for year 2022",
        {
          status: 500,
          statusText: "Internal Server Error",
        }
      );
    });
  });

  describe("retry logic", () => {
    it("should not retry on 404 errors", async () => {
      mockFetch.mockResolvedValue(RESPONSE_404());

      const { result } = renderHookWithClient(2025 as TaxYear);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, TIMEOUT);

      // Should only be called once (no retries for 404)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should retry on 500 errors up to 3 times", async () => {
      mockFetch.mockResolvedValue(RESPONSE_500());

      const { result } = renderHookWithClient(2022);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, TIMEOUT);

      // Should be called 4 times (1 initial + 3 retries)
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it("should succeed after retry", async () => {
      // First call fails, second succeeds
      mockFetch
        .mockResolvedValueOnce(RESPONSE_500())
        .mockResolvedValueOnce(RESPONSE_200(MOCK_API_RESPONSE));

      const { result } = renderHookWithClient(2022);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_API_RESPONSE.tax_brackets);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("loading state", () => {
    it("should show loading state initially", () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(RESPONSE_200(MOCK_API_RESPONSE)), 100)
          )
      );

      const { result } = renderHookWithClient(2022);

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });
  });
});
