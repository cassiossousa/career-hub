export function paginationParams(
  limit: number,
  offset: number,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return params;
}
