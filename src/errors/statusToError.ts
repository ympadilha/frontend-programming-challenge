import type { APIError } from "./APIError";
import { InternalServerError } from "./InternalServerError";
import { NotFoundError } from "./NotFoundError";

const statusToError = (status: number): APIError => {
  switch (status) {
    case 404:
      return new NotFoundError("Not found");
    case 500:
    default:
      return new InternalServerError();
  }
};

export { statusToError };
