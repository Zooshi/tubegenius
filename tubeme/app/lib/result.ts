import { Result } from '../types';

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<T>(error: string): Result<T> {
  return { success: false, error };
}

export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success;
}

export function isFailure<T>(result: Result<T>): result is { success: false; error: string } {
  return !result.success;
}
