import type { AxiosError } from "axios";
import { ResponseMessage } from "./client";

export class BaseService {
  protected handleError<T>(error: unknown, defaultMessage: string): ResponseMessage<T> {
    const axiosError = error as AxiosError<ResponseMessage<T>>;
    
    if (axiosError.response?.data?.message) {
      return {
        status: "error",
        message: axiosError.response.data.message
      };
    }
    
    if (axiosError.message) {
      return {
        status: "error",
        message: axiosError.message || defaultMessage
      };
    }
    
    return {
      status: "error",
      message: defaultMessage
    };
  }
}