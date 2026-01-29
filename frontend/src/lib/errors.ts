import type { AxiosError } from "axios";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { HTTPValidationError, ValidationError } from "@/types";

/**
 * Extracts validation errors from API error response.
 *
 * @param error - Error object from API call
 * @returns Array of ValidationError objects or null
 */
export function extractValidationErrors(
  error: unknown,
): ValidationError[] | null {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return null;
  }

  const axiosError = error as AxiosError<HTTPValidationError>;
  const responseData = axiosError.response?.data;

  if (!responseData || !Array.isArray(responseData.detail)) {
    return null;
  }

  return responseData.detail as ValidationError[];
}

const fieldNameCache = new Map<string, string | null>();

/**
 * Extracts field name from validation error location.
 * Converts ["body", "password"] to "password".
 * Uses cache for repeated lookups (js-cache-function-results).
 *
 * @param loc - Location array from ValidationError
 * @returns Field name string or null
 */
function extractFieldName(loc: (string | number)[]): string | null {
  if (loc.length === 0) return null;

  const cacheKey = JSON.stringify(loc);
  if (fieldNameCache.has(cacheKey)) {
    return fieldNameCache.get(cacheKey)!;
  }

  const lastIndex = loc.length - 1;
  const fieldName = loc[lastIndex];
  const result = typeof fieldName === "string" ? fieldName : null;

  fieldNameCache.set(cacheKey, result);
  return result;
}

/**
 * Sets validation errors from API response into React Hook Form.
 *
 * @param form - React Hook Form instance
 * @param error - Error object from API call
 */
export function setFormValidationErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
): void {
  const validationErrors = extractValidationErrors(error);

  if (!validationErrors) {
    return;
  }

  validationErrors.forEach((validationError) => {
    const fieldName = extractFieldName(validationError.loc);
    if (fieldName) {
      form.setError(fieldName as Path<TFieldValues>, {
        message: validationError.msg,
      });
    }
  });
}

/**
 * Extracts error message from API error response.
 * Handles both string and ValidationError[] formats from FastAPI.
 *
 * @param error - Error object from API call
 * @param defaultMessage - Default message if extraction fails
 * @returns Extracted error message string
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
): string {
  if (!error) {
    return defaultMessage;
  }

  if (typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<HTTPValidationError>;
    const responseData = axiosError.response?.data;

    if (!responseData) {
      return defaultMessage;
    }

    if (Array.isArray(responseData.detail)) {
      const validationErrors = responseData.detail as ValidationError[];
      if (validationErrors.length > 0) {
        return validationErrors[0].msg || defaultMessage;
      }
    }

    if (typeof responseData.detail === "string") {
      return responseData.detail;
    }
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  if (typeof error === "string") {
    return error;
  }

  return defaultMessage;
}
