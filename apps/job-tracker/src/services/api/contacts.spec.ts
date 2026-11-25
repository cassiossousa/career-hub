import { renderHook, waitFor } from '@testing-library/react';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import { isApiError } from './client';
import {
  useApplicationContacts,
  useAttachContact,
  useContacts,
  useCreateContact,
  useDetachContact,
} from './contacts';

describe('contacts api', () => {
  it('lists the contact directory', async () => {
    const { result } = renderHook(() => useContacts(), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    expect(result.current.data?.total).toBe(3);
    expect(result.current.data?.contacts.map((c) => c.name)).toContain(
      'Marina Alves',
    );
  });

  it('lists contacts linked to an application with primary flags', async () => {
    const { result } = renderHook(() => useApplicationContacts(1), {
      wrapper: ApiTestWrapper,
    });
    await waitForQuerySuccess(() => result.current.isSuccess);
    const linked = result.current.data ?? [];
    expect(linked).toHaveLength(2);
    expect(linked.find((l) => l.isPrimary)?.contact.id).toBe(1);
  });

  it('creates a contact and attaches it as primary', async () => {
    const { result } = renderHook(
      () => ({
        create: useCreateContact(),
        attach: useAttachContact(2),
        linked: useApplicationContacts(2),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.linked.isSuccess);

    result.current.create.mutate({ name: 'New Recruiter', role: 'HR' });
    await waitForQuerySuccess(() => result.current.create.isSuccess);
    const contact = result.current.create.data;
    expect(contact?.name).toBe('New Recruiter');

    result.current.attach.mutate({
      contactId: contact?.id ?? 0,
      primary: true,
    });
    await waitForQuerySuccess(() => result.current.attach.isSuccess);
    expect(result.current.attach.data?.isPrimary).toBe(true);

    await waitFor(() => {
      expect(result.current.linked.data).toHaveLength(1);
    });
  });

  it('attaches without the primary flag and detaches', async () => {
    const { result } = renderHook(
      () => ({
        attach: useAttachContact(3),
        detach: useDetachContact(3),
        linked: useApplicationContacts(3),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.linked.isSuccess);
    expect(result.current.linked.data).toHaveLength(0);

    result.current.attach.mutate({ contactId: 2 });
    await waitForQuerySuccess(() => result.current.attach.isSuccess);
    expect(result.current.attach.data?.isPrimary).toBe(false);

    result.current.detach.mutate(2);
    await waitForQuerySuccess(() => !result.current.detach.isPending);
    await waitFor(() => {
      expect(result.current.linked.data).toHaveLength(0);
    });
  });

  it('surfaces not_found for unknown contacts and unlinked detaches', async () => {
    const { result } = renderHook(
      () => ({
        attach: useAttachContact(1),
        detach: useDetachContact(1),
      }),
      { wrapper: ApiTestWrapper },
    );

    result.current.attach.mutate({ contactId: 99999 });
    await waitFor(() => {
      expect(result.current.attach.isError).toBe(true);
    });
    const attachError = result.current.attach.error;
    expect(isApiError(attachError) && attachError.code).toBe('not_found');

    result.current.detach.mutate(99999);
    await waitFor(() => {
      expect(result.current.detach.isError).toBe(true);
    });
    const detachError = result.current.detach.error;
    expect(isApiError(detachError) && detachError.code).toBe('not_found');
  });

  it('rejects attaching an already-linked contact', async () => {
    const { result } = renderHook(() => useAttachContact(1), {
      wrapper: ApiTestWrapper,
    });
    result.current.mutate({ contactId: 1 });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    const error = result.current.error;
    expect(isApiError(error) && error.code).toBe('conflict');
  });
});
