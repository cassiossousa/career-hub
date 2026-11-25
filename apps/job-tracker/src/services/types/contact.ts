import type { Schemas, Wire } from './contract';

export type Contact = Wire<Schemas['ContactResponse']>;

export type ContactListPage = Wire<Schemas['ContactListResponse']>;

export type ContactCreate = Wire<Schemas['ContactCreate']>;

export type ContactUpdate = Wire<Schemas['ContactPatch']>;

export type ApplicationContact = Wire<Schemas['ApplicationContactResponse']>;
