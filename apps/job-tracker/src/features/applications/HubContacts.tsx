import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import {
  useApplicationContacts,
  useAttachContact,
  useContacts,
  useCreateContact,
  useDetachContact,
} from '../../services/api/contacts';
import type { Application } from '../../services/types/application';
import type {
  ApplicationContact,
  Contact,
  ContactCreate,
} from '../../services/types/contact';
import {
  FieldRow,
  FormActions,
  ItemCard,
  ItemDeleteButton,
  joinedMeta,
  MetaText,
  PanelGate,
} from './HubUi';

export function HubContacts({ application }: { application: Application }) {
  const { messages } = useTranslation();
  const linkedQuery = useApplicationContacts(application.id);
  const directoryQuery = useContacts();
  const attachMutation = useAttachContact(application.id);
  const createMutation = useCreateContact();
  const [mode, setMode] = useState<'idle' | 'link' | 'create'>('idle');

  return (
    <PanelGate
      query={linkedQuery}
      subject={messages.applicationHub.tabs.contacts}
    >
      {(linked) => {
        const linkedIds = new Set(linked.map((entry) => entry.contact.id));
        const linkable = (directoryQuery.data?.contacts ?? []).filter(
          (contact) => !linkedIds.has(contact.id),
        );
        return (
          <ContactsBody
            linked={linked}
            linkable={linkable}
            directoryLoading={directoryQuery.isLoading}
            mode={mode}
            onModeChange={setMode}
            attachMutation={attachMutation}
            createMutation={createMutation}
            applicationId={application.id}
          />
        );
      }}
    </PanelGate>
  );
}

interface ContactsBodyProps {
  linked: ApplicationContact[];
  linkable: Pick<Contact, 'id' | 'name' | 'role'>[];
  directoryLoading: boolean;
  mode: 'idle' | 'link' | 'create';
  onModeChange: (mode: 'idle' | 'link' | 'create') => void;
  attachMutation: ReturnType<typeof useAttachContact>;
  createMutation: ReturnType<typeof useCreateContact>;
  applicationId: number;
}

function ContactsBody({
  linked,
  linkable,
  directoryLoading,
  mode,
  onModeChange,
  attachMutation,
  createMutation,
  applicationId,
}: ContactsBodyProps) {
  const { messages } = useTranslation();
  const t = messages.applicationHub.contacts;
  const detachMutation = useDetachContact(applicationId);

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      {linked.length === 0 && mode === 'idle' && <EmptyState title={t.empty} />}
      {linked.map((entry) => (
        <ContactRow
          key={entry.contact.id}
          entry={entry}
          onDetach={(contactId) => {
            detachMutation.mutate(contactId);
          }}
          detachPending={detachMutation.isPending}
        />
      ))}
      {mode === 'link' && !directoryLoading && linkable.length > 0 && (
        <LinkExistingForm
          contacts={linkable}
          attachMutation={attachMutation}
          onDone={() => {
            onModeChange('idle');
          }}
        />
      )}
      {mode === 'create' && (
        <NewContactForm
          createMutation={createMutation}
          attachMutation={attachMutation}
          onDone={() => {
            onModeChange('idle');
          }}
        />
      )}
      {mode === 'idle' && (
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            disabled={directoryLoading || linkable.length === 0}
            onClick={() => {
              onModeChange('link');
            }}
          >
            {t.linkExisting}
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => {
              onModeChange('create');
            }}
          >
            {t.createNew}
          </Button>
        </Stack>
      )}
      {(attachMutation.isError ||
        detachMutation.isError ||
        createMutation.isError) && (
        <Typography variant="body2" color="error">
          {messages.common.error}
        </Typography>
      )}
    </Stack>
  );
}

function ContactRow({
  entry,
  onDetach,
  detachPending,
}: {
  entry: ApplicationContact;
  onDetach: (contactId: number) => void;
  detachPending: boolean;
}) {
  const { messages } = useTranslation();
  const t = messages.applicationHub.contacts;
  const contact = entry.contact;

  return (
    <ItemCard>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2">{contact.name}</Typography>
        {entry.isPrimary && (
          <Chip size="small" color="primary" label={t.primary} />
        )}
        <ItemDeleteButton
          label={t.detach}
          pending={detachPending}
          onClick={() => {
            onDetach(contact.id);
          }}
        />
      </Stack>
      <MetaText text={joinedMeta([contact.role, contact.company])} />
      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
        {contact.email !== null && (
          <Typography variant="body2">
            <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
          </Typography>
        )}
        {contact.phone !== null && (
          <Typography variant="body2">{contact.phone}</Typography>
        )}
        {contact.linkedinUrl !== null && (
          <Link href={contact.linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </Link>
        )}
      </Stack>
    </ItemCard>
  );
}

interface LinkExistingFormProps {
  contacts: Pick<Contact, 'id' | 'name' | 'role'>[];
  attachMutation: ReturnType<typeof useAttachContact>;
  onDone: () => void;
}

function LinkExistingForm({
  contacts,
  attachMutation,
  onDone,
}: LinkExistingFormProps) {
  const { messages } = useTranslation();
  const t = messages.applicationHub.contacts;
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel>{t.name}</InputLabel>
        <Select
          label={t.name}
          value={selectedId === null ? '' : String(selectedId)}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedId(value === '' ? null : Number(value));
          }}
        >
          {contacts.map((contact) => (
            <MenuItem key={contact.id} value={String(contact.id)}>
              {contact.name}
              {contact.role !== null ? ` — ${contact.role}` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        size="small"
        disabled={selectedId === null || attachMutation.isPending}
        onClick={() => {
          if (selectedId !== null) {
            attachMutation.mutate(
              { contactId: selectedId },
              { onSuccess: onDone },
            );
          }
        }}
      >
        {t.attach}
      </Button>
      <Button size="small" onClick={onDone}>
        {messages.common.cancel}
      </Button>
      {attachMutation.isError && (
        <Typography variant="body2" color="error">
          {messages.common.error}
        </Typography>
      )}
    </Stack>
  );
}

interface NewContactFormProps {
  createMutation: ReturnType<typeof useCreateContact>;
  attachMutation: ReturnType<typeof useAttachContact>;
  onDone: () => void;
}

function NewContactForm({
  createMutation,
  attachMutation,
  onDone,
}: NewContactFormProps) {
  const { messages } = useTranslation();
  const t = messages.applicationHub.contacts;
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [nameError, setNameError] = useState(false);

  const submit = () => {
    if (name.trim() === '') {
      setNameError(true);
      return;
    }
    setNameError(false);
    const data: ContactCreate = { name: name.trim() };
    if (role.trim() !== '') data.role = role.trim();
    if (email.trim() !== '') data.email = email.trim();
    if (company.trim() !== '') data.company = company.trim();
    createMutation.mutate(data, {
      onSuccess: (contact) => {
        attachMutation.mutate(
          { contactId: contact.id, primary: true },
          { onSuccess: onDone },
        );
      },
    });
  };

  return (
    <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
      <FieldRow>
        <TextField
          size="small"
          label={t.name}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          error={nameError}
          helperText={nameError ? t.nameRequired : ''}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label={t.role}
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          size="small"
          label={t.email}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label={t.company}
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
      </FieldRow>
      <FormActions
        submitLabel={t.save}
        pending={createMutation.isPending || attachMutation.isPending}
        onSubmit={submit}
        onCancel={onDone}
        error={createMutation.isError || attachMutation.isError}
      />
    </Stack>
  );
}
