export function jsonResponse(
  ok: boolean,
  status: number,
  payload: unknown,
): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(payload),
  } as Response;
}
