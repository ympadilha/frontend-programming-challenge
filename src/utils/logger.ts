/**
 * This logger is a simple placeholder for what should be a more robust logging solution
 * It should be replaced with a more robust such as Sentry, Datadog, etc.
 * We shouldn't be logging sensitive data to the console, but again, this is just a placeholder.
 */
const logger = {
  info: (message: string, ...args: object[]) => {
    console.log(message, ...args);
  },
  warn: (message: string, ...args: object[]) => {
    console.warn(message, ...args);
  },
  error: (message: string, ...args: object[]) => {
    console.error(message, ...args);
  },
};

export { logger };
