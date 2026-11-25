import type { Schemas, Wire } from './contract';

export const OFFER_STATUSES = [
  'received',
  'negotiating',
  'accepted',
  'declined',
  'expired',
] as const satisfies readonly Schemas['OfferStatus'][];

export type OfferStatus = Schemas['OfferStatus'];

export type Offer = Wire<Schemas['OfferResponse']>;

export type OfferListPage = Wire<Schemas['OfferListResponse']>;

export type OfferCreate = Wire<Schemas['OfferCreate']>;

export type OfferUpdate = Wire<Schemas['OfferPatch']>;
