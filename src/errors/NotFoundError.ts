import { APIError } from "./APIError";

class NotFoundError extends APIError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export { NotFoundError };
