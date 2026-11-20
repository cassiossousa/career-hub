import { isApiError } from '../services/api/client';

export async function expectApiErrorCode(
  promise: Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await promise;
  } catch (error) {
    expect(isApiError(error)).toBe(true);
    if (isApiError(error)) {
      expect(error.code).toBe(code);
    }
    return;
  }
  throw new Error(`expected API error ${code}`);
}
