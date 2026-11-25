import { Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import {
  useApplicationOffers,
  useCreateOffer,
  useDeleteOffer,
} from '../../services/api/offers';
import type { Application } from '../../services/types/application';
import {
  OFFER_STATUSES,
  type Offer,
  type OfferCreate,
  type OfferStatus,
} from '../../services/types/offer';
import {
  AddItemButton,
  EnumSelectField,
  FieldRow,
  ItemCard,
  ItemDeleteButton,
  ItemHeader,
  joinedMeta,
  MetaText,
  MutationFormActions,
  PanelGate,
} from './HubUi';
import { NotesTextField } from './NotesTextField';

export function HubOffers({ application }: { application: Application }) {
  const { messages } = useTranslation();
  const offersQuery = useApplicationOffers(application.id);
  const createMutation = useCreateOffer(application.id);
  const [showForm, setShowForm] = useState(false);

  return (
    <PanelGate
      query={offersQuery}
      subject={messages.applicationHub.tabs.offers}
    >
      {(page) => (
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          {page.offers.length === 0 && !showForm && (
            <EmptyState title={messages.applicationHub.offers.empty} />
          )}
          {page.offers.map((offer) => (
            <OfferRow
              key={offer.id}
              offer={offer}
              applicationId={application.id}
            />
          ))}
          {showForm ? (
            <OfferForm
              createMutation={createMutation}
              onDone={() => {
                setShowForm(false);
              }}
            />
          ) : (
            <AddItemButton
              label={messages.applicationHub.offers.add}
              onClick={() => {
                setShowForm(true);
              }}
            />
          )}
        </Stack>
      )}
    </PanelGate>
  );
}

function OfferRow({
  offer,
  applicationId,
}: {
  offer: Offer;
  applicationId: number;
}) {
  const { locale, messages } = useTranslation();
  const t = messages.applicationHub.offers;
  const deleteMutation = useDeleteOffer(applicationId);
  const salary =
    offer.salaryMin === null && offer.salaryMax === null
      ? null
      : [offer.salaryMin, offer.salaryMax]
          .filter((v): v is number => v !== null)
          .map((v) => `${offer.currency} ${v.toLocaleString(locale)}`)
          .join(' – ');

  return (
    <ItemCard>
      <ItemHeader title={offer.currency}>
        <Chip
          size="small"
          color={offer.status === 'accepted' ? 'success' : 'default'}
          label={t.statuses[offer.status]}
        />
        <ItemDeleteButton
          label={t.delete}
          pending={deleteMutation.isPending}
          onClick={() => {
            deleteMutation.mutate(offer.id);
          }}
        />
      </ItemHeader>
      {salary !== null && <Typography variant="body2">{salary}</Typography>}
      <MetaText
        text={joinedMeta([
          offer.equityNotes,
          offer.benefitsNotes,
          offer.decidedAt === null
            ? null
            : `${t.decidedAt}: ${new Date(offer.decidedAt).toLocaleDateString(locale)}`,
        ])}
      />
      {offer.notes !== null && offer.notes !== '' && (
        <Typography variant="body2">{offer.notes}</Typography>
      )}
    </ItemCard>
  );
}

interface OfferFormProps {
  createMutation: ReturnType<typeof useCreateOffer>;
  onDone: () => void;
}

function optionalNumber(raw: string): number | null {
  if (raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function buildOfferCreate(draft: {
  currency: string;
  salaryMin: string;
  salaryMax: string;
  equity: string;
  benefits: string;
  status: OfferStatus;
  decidedAt: string;
  notes: string;
}): OfferCreate {
  const data: OfferCreate = {
    currency: draft.currency.trim().toUpperCase(),
    status: draft.status,
  };
  const min = optionalNumber(draft.salaryMin);
  const max = optionalNumber(draft.salaryMax);
  if (min !== null) data.salaryMin = min;
  if (max !== null) data.salaryMax = max;
  if (draft.equity.trim() !== '') data.equityNotes = draft.equity.trim();
  if (draft.benefits.trim() !== '') {
    data.benefitsNotes = draft.benefits.trim();
  }
  if (draft.decidedAt !== '') {
    data.decidedAt = new Date(draft.decidedAt).toISOString();
  }
  if (draft.notes.trim() !== '') data.notes = draft.notes.trim();
  return data;
}

function OfferForm({ createMutation, onDone }: OfferFormProps) {
  const { messages } = useTranslation();
  const t = messages.applicationHub.offers;
  const [currency, setCurrency] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [equity, setEquity] = useState('');
  const [benefits, setBenefits] = useState('');
  const [status, setStatus] = useState<OfferStatus>('received');
  const [decidedAt, setDecidedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [currencyError, setCurrencyError] = useState(false);

  const currencyValid = /^[a-z]{3}$/i.test(currency.trim());

  const submit = () => {
    if (!currencyValid) {
      setCurrencyError(true);
      return;
    }
    setCurrencyError(false);
    createMutation.mutate(
      buildOfferCreate({
        currency,
        salaryMin,
        salaryMax,
        equity,
        benefits,
        status,
        decidedAt,
        notes,
      }),
      { onSuccess: onDone },
    );
  };

  return (
    <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
      <FieldRow>
        <TextField
          size="small"
          label={t.currency}
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
          }}
          error={currencyError}
          helperText={currencyError ? t.currencyRequired : ''}
          sx={{ width: 120 }}
        />
        <TextField
          size="small"
          type="number"
          label={t.salaryMin}
          value={salaryMin}
          onChange={(e) => {
            setSalaryMin(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          type="number"
          label={t.salaryMax}
          value={salaryMax}
          onChange={(e) => {
            setSalaryMax(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
      </FieldRow>
      <FieldRow>
        <EnumSelectField
          label={t.status}
          value={status}
          options={OFFER_STATUSES}
          optionLabel={(option) => t.statuses[option]}
          onChange={setStatus}
        />
        <TextField
          size="small"
          type="date"
          label={t.decidedAt}
          value={decidedAt}
          onChange={(e) => {
            setDecidedAt(e.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1 }}
        />
      </FieldRow>
      <TextField
        size="small"
        label={t.equity}
        value={equity}
        onChange={(e) => {
          setEquity(e.target.value);
        }}
      />
      <TextField
        size="small"
        label={t.benefits}
        value={benefits}
        onChange={(e) => {
          setBenefits(e.target.value);
        }}
      />
      <NotesTextField label={t.notes} value={notes} onChange={setNotes} />
      <MutationFormActions
        mutation={createMutation}
        submitLabel={t.add}
        onSubmit={submit}
        onCancel={onDone}
      />
    </Stack>
  );
}
