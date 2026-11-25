import type { Schemas, Wire } from './contract';

export type CoverLetter = Wire<Schemas['CoverLetterResponse']>;

export type CoverLetterUpsert = Wire<Schemas['CoverLetterUpsert']>;
