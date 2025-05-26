# Tax Calculator Application

Responsive web application for calculating Canadian federal income tax based on marginal tax rates.
Built as a solution to the Points developer interview assignment.

Also, one important thing I'd like to mention is that since the API response is `cached by year`, when you do multiple searches for the same year, the app's calculation is `instant`, giving the false impression that nothing is happening.

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **pnpm** (or npm/yarn)
- **Docker** (for running the API server)

## Quick Start

### 1. Start the API Server

First, download and run the Points interview test server:

```bash
# Pull the Docker image
docker pull ptsdocker16/interview-test-server

# Run the API server
docker run --init -p 5001:5001 -it ptsdocker16/interview-test-server
```

The API will be available at `http://localhost:5001`. You should see the API documentation when you navigate to this URL in your browser.

### 2. Install Dependencies

```bash
# Install project dependencies (you can use yarn or npm)
pnpm install
```

### 3. Start the Development Server

```bash
# Start the Vite development server
pnpm dev
```

The application will be available at `http://localhost:5173`.

### 4. Run the tests

- Component test: `App.test.tsx` (closer to an UI e2e)
- Unit tests: All the rest

```bash
pnpm test
pnpm test:unit
pnpm test:component
```

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm preview` - Preview the production build locally
- `pnpm lint` - Run ESLint to check code quality
- `pnpm test` - Run vitest to run all tests
- `pnpm test:unit` - Run vitest to run all unit tests
- `pnpm test:component` - Run vitest to run all component tests

## How It Works

### Tax Calculation Logic

The application implements the Canadian federal marginal tax system:

1. **Fetch Tax Brackets**: Retrieves current tax brackets from the API for the selected year
2. **Marginal Calculation**: Applies tax rates only to income within each bracket
3. **Progressive System**: Higher income portions are taxed at higher rates

### API Integration

- **Endpoint**: `/tax-calculator/tax-year/{year}`
- **Supported Years**: 2019, 2020, 2021, 2022
- **Error Handling**: Automatic retry logic for API failures
- **Retries**: Exponential backoff for failed requests (max 8s)

### Example Calculations (2022 Tax Year)

| Annual Income | Total Tax   | Effective Rate |
| ------------- | ----------- | -------------- |
| $0            | $0.00       | 0.00%          |
| $50,000       | $7,500.00   | 15.00%         |
| $100,000      | $17,739.17  | 17.74%         |
| $1,234,567    | $385,587.65 | 31.23%         |

## Design Features

### User Experience

- **Input validation**: Only numbers are allowed and year dropdown is restricted to only the years supported by the API.
- **Input formatting**: Currency input formatting.
- **Loading states**: Loading state during API calls
- **API retries on fail**: API retries on failure up to 3 times (easily configurable)
- **Responsive layout**: Almost, it's very much possible to improve it!

### Technical Architecture

- **React 19**
- **TypeScript**
- **Vite**
- **@tanstack/react-query**
- **Vitest (for testing)**
- **React testing library (for testing)**

## Technical Implementation

### Disclaimer

I used Cursor for this project, which means that I used AI. It mostly helped me with a nice interface and generating some of the code (which I had to refactor a lot to get it to my liking).

I know there'll be a follow-up interview and I'll be able to explain all the parts of the code, no problem!

With that being said, please continue reading :)

### Project Structure

```
src/
├── components/           # React components
│   ├── App
│   ├── TaxBreakdown
│   ├── TaxCalculatorForm
│   ├── TaxCalculatorResults
│   └── ErrorMessage
├── hooks/               # Custom hooks
│   └── useTaxCalculator.ts
├── services/            # API and business logic
│   └── taxCalculator
├── types/               # Global type definitions
│   └── tax.ts
├── utils/               # Utility functions
│   └── [logger|envUtils].ts
```

### Error Handling

In cases there are errors with the API, these errors are mapped to custom `errors/APIError` objects in `errors/statusToError.ts` and are handled accordingly.

Different errors result in different behaviors, such as 404 not triggering retries.

Also, internal information regarding the errors is not leaked to the outside (not to worry too much in this project but it's worth mentioning).

### Logging

Not using any specific tool for logging, instead, I defined a `mock logger`, it's the `utils/logger.ts`.

This mock logger is just to present the intention that we should have a more complete logging system, either using Sentry, Datadog, or whatever the team chooses.

## Build for Production

```bash
# Create optimized production build
pnpm build

# Preview the production build
pnpm preview
```

If you want to test against `lighthouse` for example, use the `preview` mentioned here.

## Resources

- [Points Interview Assignment](https://github.com/Points/interview-test-server)
- [Canadian Tax Brackets Reference](https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html)
- [Marginal Tax Rate Explanation](https://en.wikipedia.org/wiki/Tax_bracket)
