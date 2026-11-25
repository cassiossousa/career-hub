import {
  type UseMutationOptions,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import type {
  ApplicationContact,
  Contact,
  ContactCreate,
  ContactListPage,
} from '../types/contact';
import { apiClient } from './client';
import {
  useInvalidatingDelete,
  useInvalidatingMutation,
} from './mutationUtils';
import {
  applicationContactsResponseSchema,
  contactResponseSchema,
  contactsResponseSchema,
} from './schemas';

const CONTACTS_QUERY_KEY = ['contacts'];
const APPLICATION_CONTACTS_QUERY_KEY = 'applicationContacts';

function applicationContactsKey(applicationId: number) {
  return [
    ...CONTACTS_QUERY_KEY,
    APPLICATION_CONTACTS_QUERY_KEY,
    applicationId,
  ] as const;
}

/** Full contact directory (not scoped to an application). */
export function useContacts(
  options?: Omit<UseQueryOptions<ContactListPage>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/api/contacts');
      return contactsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

/** Contacts linked to one application, with primary flag. */
export function useApplicationContacts(
  applicationId: number,
  options?: Omit<UseQueryOptions<ApplicationContact[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: applicationContactsKey(applicationId),
    queryFn: async () => {
      const response = await apiClient.get<unknown>(
        `/api/applications/${applicationId}/contacts`,
      );
      return applicationContactsResponseSchema.parse(response.data);
    },
    ...options,
  });
}

export function useCreateContact(
  options?: Omit<
    UseMutationOptions<Contact, Error, ContactCreate>,
    'mutationFn'
  >,
) {
  return useInvalidatingMutation(
    async (data: ContactCreate) => {
      const response = await apiClient.post<unknown>('/api/contacts', data);
      return contactResponseSchema.parse(response.data);
    },
    () => [CONTACTS_QUERY_KEY],
    options,
  );
}

export function useAttachContact(
  applicationId: number,
  options?: Omit<
    UseMutationOptions<
      ApplicationContact,
      Error,
      { contactId: number; primary?: boolean }
    >,
    'mutationFn'
  >,
) {
  return useInvalidatingMutation(
    async ({ contactId, primary }) => {
      const params = new URLSearchParams();
      if (primary === true) params.set('primary', 'true');
      const query = params.size > 0 ? `?${params.toString()}` : '';
      const response = await apiClient.post<unknown>(
        `/api/applications/${applicationId}/contacts/${contactId}${query}`,
        {},
      );
      return applicationContactsResponseSchema.element.parse(response.data);
    },
    () => [applicationContactsKey(applicationId)],
    options,
  );
}

export function useDetachContact(
  applicationId: number,
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) {
  return useInvalidatingDelete(
    (contactId) =>
      apiClient.delete(
        `/api/applications/${applicationId}/contacts/${contactId}`,
      ),
    () => [applicationContactsKey(applicationId)],
    options,
  );
}
