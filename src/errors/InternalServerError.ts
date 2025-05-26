import { APIError } from "./APIError";

class InternalServerError extends APIError {
  constructor(message: string = "Something went wrong, please try again") {
    super(message, 500);
  }
}

export { InternalServerError };
