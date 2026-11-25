import { useParams } from 'react-router-dom';

/** Parses the `:id` route param into a positive integer, or `null`. */
export function useApplicationIdParam(): number | null {
  const { id } = useParams<{ id: string }>();
  const parsed = id ? Number.parseInt(id, 10) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
