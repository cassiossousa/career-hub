import { renderHook, waitFor } from '@testing-library/react';
import { expectApiErrorCode } from '../../test/apiError';
import { ApiTestWrapper, waitForQuerySuccess } from '../../test/TestUtils';
import { apiClient } from './client';
import {
  useApplicationOffers,
  useCreateOffer,
  useDeleteOffer,
  useUpdateOffer,
} from './offers';
import { offerResponseSchema, offersResponseSchema } from './schemas';

describe('application offers api', () => {
  it('lists offers seeded for an application', async () => {
    const response = await apiClient.get('/api/applications/9/offers');
    const page = offersResponseSchema.parse(response.data);
    expect(page.total).toBe(1);
    expect(page.offers[0]?.currency).toBe('BRL');
    expect(page.offers[0]?.status).toBe('negotiating');
  });

  it('creates an offer, uppercasing currency and defaulting status', async () => {
    const response = await apiClient.post('/api/applications/1/offers', {
      currency: 'usd',
      salaryMin: 150000,
      salaryMax: 180000,
    });
    const offer = offerResponseSchema.parse(response.data);
    expect(offer.applicationId).toBe(1);
    expect(offer.currency).toBe('USD');
    expect(offer.status).toBe('received');
    expect(offer.salaryMin).toBe(150000);
  });

  it('does not fabricate a currency when the field is missing', async () => {
    await expect(
      apiClient.post('/api/applications/1/offers', { salaryMin: 1000 }),
    ).rejects.toThrow();
  });

  it('patches and deletes an offer', async () => {
    const created = await apiClient.post('/api/applications/2/offers', {
      currency: 'EUR',
    });
    const offer = offerResponseSchema.parse(created.data);

    const patched = await apiClient.patch(`/api/offers/${offer.id}`, {
      status: 'accepted',
      decidedAt: '2026-01-15T00:00:00.000Z',
    });
    const updated = offerResponseSchema.parse(patched.data);
    expect(updated.status).toBe('accepted');
    expect(updated.decidedAt).not.toBeNull();

    await apiClient.delete(`/api/offers/${offer.id}`);
    await expectApiErrorCode(
      apiClient.patch(`/api/offers/${offer.id}`, { notes: 'gone' }),
      'not_found',
    );
  });
});

describe('offers hooks', () => {
  it('lists offers for an application and refetches after create', async () => {
    const { result } = renderHook(
      () => ({
        list: useApplicationOffers(9),
        create: useCreateOffer(9),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);
    const before = result.current.list.data?.total ?? 0;

    result.current.create.mutate({ currency: 'BRL', salaryMin: 90000 });
    await waitForQuerySuccess(() => result.current.create.isSuccess);

    await waitFor(() => {
      expect(result.current.list.data?.total).toBe(before + 1);
    });
  });

  it('updates and deletes an offer through the hooks', async () => {
    const { result } = renderHook(
      () => ({
        list: useApplicationOffers(9),
        update: useUpdateOffer(9),
        delete: useDeleteOffer(9),
      }),
      { wrapper: ApiTestWrapper },
    );
    await waitForQuerySuccess(() => result.current.list.isSuccess);
    const offerId = result.current.list.data?.offers[0]?.id ?? 0;
    const before = result.current.list.data?.total ?? 0;

    result.current.update.mutate({ id: offerId, data: { status: 'accepted' } });
    await waitForQuerySuccess(() => result.current.update.isSuccess);
    expect(result.current.update.data?.status).toBe('accepted');

    result.current.delete.mutate(offerId);
    await waitFor(() => {
      expect(result.current.list.data?.total).toBe(before - 1);
    });
  });

  it('surfaces not_found when deleting a missing offer', async () => {
    await expectApiErrorCode(
      apiClient.delete('/api/offers/99999'),
      'not_found',
    );
  });
});
