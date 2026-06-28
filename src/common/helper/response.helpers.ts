import { ApiResponse } from './api-response.interface';

export function successResponse<T>(message: string, data: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}
