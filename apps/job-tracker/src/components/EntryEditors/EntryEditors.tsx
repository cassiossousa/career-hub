import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { SxProps, Theme } from '@mui/material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { type ReactNode, useState } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { SKILL_CATEGORIES } from '../../services/jobOptions';
import type {
  ExperienceBullet,
  ExperienceEntry,
  PortfolioBasics,
  PortfolioLink,
  ProjectEntry,
  SkillGroup,
} from '../../services/types/portfolio';
import type {
  CertificationEntry,
  EducationEntry,
  LanguageEntry,
} from '../../services/types/resume';

const LINK_KINDS = ['github', 'linkedin', 'website', 'email', 'other'] as const;

type ListScalar = string | number | null | undefined;
type EntryUpdater<T> = (
  key: keyof T & string,
  value: T[keyof T] | ListScalar,
) => void;

const fieldFlex: SxProps<Theme> = { flex: 1, minWidth: 160 };
const fieldFlexWide: SxProps<Theme> = { flex: 1, minWidth: 180 };
const fieldFlexTitle: SxProps<Theme> = { flex: 1, minWidth: 200 };
const fieldFixed: SxProps<Theme> = { minWidth: 140 };
const fieldNarrow: SxProps<Theme> = { minWidth: 120 };
const fieldStars: SxProps<Theme> = { minWidth: 110 };

export function useListKeys(length: number): string[] {
  const [keys, setKeys] = useState<string[]>(() =>
    Array.from({ length }, () => crypto.randomUUID()),
  );
  if (keys.length !== length) {
    const next = Array.from(
      { length },
      (_, index) => keys[index] ?? crypto.randomUUID(),
    );
    setKeys(next);
    return next;
  }
  return keys;
}

function textToStringList(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const emptyToNull = (value: string) => (value === '' ? null : value);

interface EntryFieldProps {
  label: string;
  value: ListScalar;
  onValue: (value: string) => void;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  type?: string | undefined;
  multiline?: boolean | undefined;
  rows?: number | undefined;
  sx?: SxProps<Theme> | undefined;
  fullWidth?: boolean | undefined;
}

function EntryField({
  label,
  value,
  onValue,
  disabled,
  required,
  placeholder,
  type,
  multiline,
  rows,
  sx,
  fullWidth,
}: EntryFieldProps) {
  return (
    <TextField
      label={label}
      value={value ?? ''}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      type={type}
      multiline={multiline}
      rows={rows}
      fullWidth={fullWidth}
      sx={sx}
      onChange={(e) => {
        onValue(e.target.value);
      }}
    />
  );
}

/** Field spec for BoundFields: f=entry key, l=label; req=required,
 * nul=empty string becomes null, num=nullable number input,
 * fw=fullWidth, ml=multiline, rows, ph=placeholder, sx=layout. */
interface BoundFieldSpec<T> {
  f: keyof T & string;
  l: string;
  req?: boolean | undefined;
  nul?: boolean | undefined;
  num?: boolean | undefined;
  fw?: boolean | undefined;
  ml?: boolean | undefined;
  rows?: number | undefined;
  ph?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}

interface BoundFieldsProps<T> {
  entry: T;
  update: EntryUpdater<T>;
  specs: BoundFieldSpec<T>[];
  disabled?: boolean | undefined;
}

function BoundFields<T extends object>({
  entry,
  update,
  specs,
  disabled,
}: BoundFieldsProps<T>) {
  return (
    <>
      {specs.map((s) => {
        const raw: unknown = entry[s.f];
        const value: ListScalar =
          typeof raw === 'string' ||
          typeof raw === 'number' ||
          raw === null ||
          raw === undefined
            ? raw
            : undefined;
        return (
          <EntryField
            key={s.f}
            label={s.l}
            value={value}
            disabled={disabled}
            required={s.req}
            placeholder={s.ph}
            type={s.num ? 'number' : undefined}
            multiline={s.ml}
            rows={s.rows}
            fullWidth={s.fw}
            sx={s.sx}
            onValue={(v) => {
              const parsed: ListScalar = s.num
                ? v === ''
                  ? null
                  : Number(v)
                : s.nul
                  ? emptyToNull(v)
                  : v;
              update(s.f, parsed);
            }}
          />
        );
      })}
    </>
  );
}

type ScalarFieldProps = Omit<EntryFieldProps, 'required' | 'fullWidth'>;

function RequiredField(props: ScalarFieldProps) {
  return <EntryField {...props} required fullWidth />;
}

type NullableFieldBase = Omit<EntryFieldProps, 'required' | 'onValue'>;

interface NullableFieldProps extends NullableFieldBase {
  onValue: (value: string | null) => void;
}

function NullableField({ onValue, ...rest }: NullableFieldProps) {
  return (
    <EntryField
      {...rest}
      onValue={(v) => {
        onValue(emptyToNull(v));
      }}
    />
  );
}

interface RemoveButtonProps {
  disabled?: boolean | undefined;
  onClick: () => void;
}

function RemoveButton({ disabled, onClick }: RemoveButtonProps) {
  const { messages } = useTranslation();
  return (
    <IconButton
      aria-label={messages.common.delete}
      disabled={disabled}
      onClick={onClick}
      size="small"
    >
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}

function EntryRow({
  disabled,
  onRemove,
}: {
  disabled?: boolean | undefined;
  onRemove: () => void;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
      <RemoveButton disabled={disabled} onClick={onRemove} />
    </Stack>
  );
}

interface DateRangeFieldsProps {
  start: string | null | undefined;
  end: string | null | undefined;
  labels: { start: string; end: string };
  startPlaceholder?: string | undefined;
  endPlaceholder?: string | undefined;
  startRequired?: boolean | undefined;
  startNullable?: boolean | undefined;
  endNullable?: boolean | undefined;
  disabled?: boolean | undefined;
  onStart: (value: string | null) => void;
  onEnd: (value: string | null) => void;
}

function DateRangeFields({
  start,
  end,
  labels,
  startPlaceholder,
  endPlaceholder,
  startRequired,
  startNullable,
  endNullable,
  disabled,
  onStart,
  onEnd,
}: DateRangeFieldsProps) {
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
      <EntryField
        label={labels.start}
        value={start}
        disabled={disabled}
        onValue={(v) => {
          onStart(startNullable ? emptyToNull(v) : v);
        }}
        placeholder={startPlaceholder}
        required={startRequired}
        sx={fieldFixed}
      />
      <EntryField
        label={labels.end}
        value={end}
        disabled={disabled}
        onValue={(v) => {
          onEnd(endNullable === false ? v : emptyToNull(v));
        }}
        placeholder={endPlaceholder}
        sx={fieldFixed}
      />
    </Stack>
  );
}

interface StringListEditorProps {
  label: string;
  items: string[] | undefined;
  onChange: (items: string[]) => void;
}

function StringListEditor({ label, items, onChange }: StringListEditorProps) {
  const { messages } = useTranslation();
  const [draft, setDraft] = useState('');

  const commit = () => {
    const parsed = textToStringList(draft);
    if (parsed.length === 0) return;
    const merged = [...(items ?? []), ...parsed];
    onChange([...new Set(merged)]);
    setDraft('');
  };

  const remove = (index: number) => {
    onChange((items ?? []).filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      {(items ?? []).length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {(items ?? []).map((item, index) => (
            <Chip
              key={item}
              label={item}
              size="small"
              onDelete={() => {
                remove(index);
              }}
            />
          ))}
        </Stack>
      )}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          size="small"
          label={messages.resumes.addItem}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
          sx={{ flex: 1 }}
        />
        <IconButton
          aria-label={messages.common.add}
          onClick={commit}
          disabled={draft.trim().length === 0}
          size="small"
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}

interface EntryListProps<T> {
  items: T[] | undefined;
  createItem: () => T;
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: EntryUpdater<T>) => ReactNode;
  addLabel: string;
  disabled?: boolean | undefined;
}

function EntryList<T extends object>({
  items,
  createItem,
  onChange,
  renderItem,
  addLabel,
  disabled,
}: EntryListProps<T>) {
  const list = items ?? [];
  const keys = useListKeys(list.length);
  const updateAt = (
    index: number,
    key: keyof T & string,
    value: T[keyof T] | ListScalar,
  ) => {
    onChange(
      list.map((item, i) =>
        i === index ? Object.assign({}, item, { [key]: value }) : item,
      ),
    );
  };
  const removeAt = (index: number) => {
    onChange(list.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={2}>
      {list.map((item, index) => (
        <Box
          key={keys[index]}
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Stack spacing={1.5}>
            <EntryRow
              disabled={disabled}
              onRemove={() => {
                removeAt(index);
              }}
            />
            {renderItem(item, (key, value) => {
              updateAt(index, key, value);
            })}
          </Stack>
        </Box>
      ))}
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={() => {
          onChange([...list, createItem()]);
        }}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}

interface BasicsEditorProps {
  value: PortfolioBasics;
  onChange: (basics: PortfolioBasics) => void;
  disabled?: boolean | undefined;
}

export function BasicsEditor({ value, onChange, disabled }: BasicsEditorProps) {
  const { messages } = useTranslation();
  const basics = messages.resumes.basics;
  const linkKeys = useListKeys(value.links.length);

  const set = <K extends keyof PortfolioBasics>(
    key: K,
    v: PortfolioBasics[K],
  ) => {
    onChange({ ...value, [key]: v });
  };

  const updateLink = (index: number, patch: Partial<PortfolioLink>) => {
    set(
      'links',
      value.links.map((link, i) =>
        i === index ? { ...link, ...patch } : link,
      ),
    );
  };

  return (
    <Stack spacing={2}>
      <RequiredField
        label={basics.fullName}
        value={value.fullName}
        onValue={(v) => {
          set('fullName', v);
        }}
        disabled={disabled}
      />
      <RequiredField
        label={basics.headline}
        value={value.headline}
        onValue={(v) => {
          set('headline', v);
        }}
        disabled={disabled}
      />
      <EntryField
        label={basics.subtitle}
        value={value.subtitle}
        onValue={(v) => {
          set('subtitle', v);
        }}
        fullWidth
        disabled={disabled}
      />
      <RequiredField
        label={basics.username}
        value={value.username}
        onValue={(v) => {
          set('username', v);
        }}
        disabled={disabled}
      />
      <RequiredField
        label={basics.location}
        value={value.location}
        onValue={(v) => {
          set('location', v);
        }}
        disabled={disabled}
      />
      <NullableField
        label={basics.avatarUrl}
        value={value.avatarUrl}
        onValue={(v) => {
          set('avatarUrl', v);
        }}
        fullWidth
        disabled={disabled}
      />
      <Typography variant="subtitle2">{basics.links}</Typography>
      {value.links.map((link, index) => (
        <Stack
          key={linkKeys[index]}
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap' }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{basics.linkKind}</InputLabel>
            <Select
              value={link.kind}
              label={basics.linkKind}
              disabled={disabled}
              onChange={(e) => {
                updateLink(index, {
                  kind: e.target.value,
                });
              }}
            >
              {LINK_KINDS.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {kind}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <EntryField
            label={basics.linkUrl}
            value={link.url}
            disabled={disabled}
            onValue={(v) => {
              updateLink(index, { url: v });
            }}
            sx={fieldFlexWide}
          />
          <NullableField
            label={basics.linkLabel}
            value={link.label}
            disabled={disabled}
            onValue={(v) => {
              updateLink(index, { label: v });
            }}
            sx={fieldFlex}
          />
          <RemoveButton
            disabled={disabled}
            onClick={() => {
              set(
                'links',
                value.links.filter((_, i) => i !== index),
              );
            }}
          />
        </Stack>
      ))}
      <Button
        variant="text"
        size="small"
        startIcon={<AddIcon />}
        disabled={disabled}
        onClick={() => {
          set('links', [
            ...value.links,
            { kind: 'website', url: '', label: null },
          ]);
        }}
        sx={{ alignSelf: 'flex-start' }}
      >
        {basics.addLink}
      </Button>
    </Stack>
  );
}

interface ExperienceEditorProps {
  value: ExperienceEntry[] | undefined;
  onChange: (entries: ExperienceEntry[]) => void;
  disabled?: boolean | undefined;
}

export function ExperienceEditor({
  value,
  onChange,
  disabled,
}: ExperienceEditorProps) {
  const { messages } = useTranslation();
  const t = messages.resumes.experience;
  const primarySpecs: BoundFieldSpec<ExperienceEntry>[] = [
    { f: 'company', l: t.company, req: true, fw: true },
    { f: 'role', l: t.role, req: true, fw: true },
  ];
  const locationSpecs: BoundFieldSpec<ExperienceEntry>[] = [
    { f: 'location', l: t.location, nul: true, sx: fieldFlex },
  ];

  return (
    <EntryList<ExperienceEntry>
      items={value}
      createItem={() => ({
        company: '',
        role: '',
        location: null,
        start: '',
        end: null,
        bullets: [],
      })}
      onChange={onChange}
      addLabel={t.add}
      disabled={disabled}
      renderItem={(entry, update) => (
        <>
          <BoundFields
            entry={entry}
            update={update}
            specs={primarySpecs}
            disabled={disabled}
          />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <BoundFields
              specs={locationSpecs}
              entry={entry}
              update={update}
              disabled={disabled}
            />
            <DateRangeFields
              start={entry.start}
              end={entry.end}
              labels={{ start: t.start, end: t.end }}
              startPlaceholder="YYYY-MM"
              endPlaceholder={t.present}
              startRequired
              disabled={disabled}
              onStart={(v) => {
                update('start', v ?? '');
              }}
              onEnd={(v) => {
                update('end', v);
              }}
            />
          </Stack>
          <Typography variant="subtitle2">{t.bullets}</Typography>
          <EntryList<ExperienceBullet>
            items={entry.bullets}
            createItem={() => ({ text: '', skills: [] })}
            onChange={(bullets) => {
              update('bullets', bullets);
            }}
            addLabel={t.addBullet}
            disabled={disabled}
            renderItem={(bullet, updateBullet) => (
              <>
                <BoundFields
                  entry={bullet}
                  update={updateBullet}
                  specs={[{ f: 'text', l: t.bulletText, req: true, fw: true }]}
                  disabled={disabled}
                />
                <StringListEditor
                  label={t.skills}
                  items={bullet.skills}
                  onChange={(skills) => {
                    updateBullet('skills', skills);
                  }}
                />
              </>
            )}
          />
        </>
      )}
    />
  );
}

interface EducationEditorProps {
  value: EducationEntry[] | undefined;
  onChange: (entries: EducationEntry[]) => void;
  disabled?: boolean | undefined;
}

export function EducationEditor({
  value,
  onChange,
  disabled,
}: EducationEditorProps) {
  const { messages } = useTranslation();
  const t = messages.resumes.education;
  const primarySpecs: BoundFieldSpec<EducationEntry>[] = [
    { f: 'institution', l: t.institution, req: true, fw: true },
    { f: 'degree', l: t.degree, req: true, fw: true },
    { f: 'fieldOfStudy', l: t.fieldOfStudy, nul: true, fw: true },
  ];
  const detailsSpecs: BoundFieldSpec<EducationEntry>[] = [
    { f: 'details', l: t.details, nul: true, ml: true, rows: 2, fw: true },
  ];

  return (
    <EntryList<EducationEntry>
      items={value}
      createItem={() => ({
        institution: '',
        degree: '',
        fieldOfStudy: null,
        start: null,
        end: null,
        details: null,
      })}
      onChange={onChange}
      addLabel={t.add}
      disabled={disabled}
      renderItem={(entry, update) => (
        <>
          <BoundFields
            specs={primarySpecs}
            disabled={disabled}
            entry={entry}
            update={update}
          />
          <DateRangeFields
            start={entry.start}
            end={entry.end}
            labels={{ start: t.start, end: t.end }}
            startPlaceholder="YYYY-MM"
            endPlaceholder="YYYY-MM"
            startNullable
            endNullable
            disabled={disabled}
            onStart={(v) => {
              update('start', v);
            }}
            onEnd={(v) => {
              update('end', v);
            }}
          />
          <BoundFields
            entry={entry}
            update={update}
            specs={detailsSpecs}
            disabled={disabled}
          />
        </>
      )}
    />
  );
}

interface CertificationEditorProps {
  value: CertificationEntry[] | undefined;
  onChange: (entries: CertificationEntry[]) => void;
  disabled?: boolean | undefined;
}

export function CertificationEditor({
  value,
  onChange,
  disabled,
}: CertificationEditorProps) {
  const { messages } = useTranslation();
  const t = messages.resumes.certifications;
  const nameSpecs: BoundFieldSpec<CertificationEntry>[] = [
    { f: 'name', l: t.name, req: true, fw: true },
  ];
  const rowSpecs: BoundFieldSpec<CertificationEntry>[] = [
    { f: 'issuer', l: t.issuer, nul: true, sx: fieldFlex },
    { f: 'url', l: t.url, nul: true, sx: fieldFlex },
  ];
  const yearSpecs: BoundFieldSpec<CertificationEntry>[] = [
    { f: 'year', l: t.year, num: true, sx: fieldNarrow },
  ];

  return (
    <EntryList<CertificationEntry>
      items={value}
      createItem={() => ({ name: '', issuer: null, url: null, year: null })}
      onChange={onChange}
      addLabel={t.add}
      disabled={disabled}
      renderItem={(entry, update) => (
        <>
          <BoundFields
            disabled={disabled}
            specs={nameSpecs}
            update={update}
            entry={entry}
          />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <BoundFields
              entry={entry}
              update={update}
              specs={rowSpecs}
              disabled={disabled}
            />
            <BoundFields
              specs={yearSpecs}
              update={update}
              entry={entry}
              disabled={disabled}
            />
          </Stack>
        </>
      )}
    />
  );
}

interface LanguageEditorProps {
  value: LanguageEntry[] | undefined;
  onChange: (entries: LanguageEntry[]) => void;
  disabled?: boolean | undefined;
}

export function LanguageEditor({
  value,
  onChange,
  disabled,
}: LanguageEditorProps) {
  const { messages } = useTranslation();
  const t = messages.resumes.languages;
  const rowSpecs: BoundFieldSpec<LanguageEntry>[] = [
    { f: 'name', l: t.name, req: true, sx: fieldFlex },
    { f: 'proficiency', l: t.proficiency, nul: true, sx: fieldFlex },
  ];

  return (
    <EntryList<LanguageEntry>
      items={value}
      createItem={() => ({ name: '', proficiency: null })}
      onChange={onChange}
      addLabel={t.add}
      disabled={disabled}
      renderItem={(entry, update) => (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <BoundFields
            entry={entry}
            update={update}
            specs={rowSpecs}
            disabled={disabled}
          />
        </Stack>
      )}
    />
  );
}

interface ProjectEditorProps {
  value: ProjectEntry[] | undefined;
  onChange: (entries: ProjectEntry[]) => void;
  disabled?: boolean | undefined;
}

export function ProjectEditor({
  value,
  onChange,
  disabled,
}: ProjectEditorProps) {
  const { messages } = useTranslation();
  const t = messages.resumes.projects;
  const titleSpecs: BoundFieldSpec<ProjectEntry>[] = [
    { f: 'slug', l: t.slug, req: true, sx: fieldFixed },
    { f: 'title', l: t.title, req: true, sx: fieldFlexTitle },
  ];
  const summarySpecs: BoundFieldSpec<ProjectEntry>[] = [
    { f: 'summary', l: t.summary, req: true, ml: true, rows: 2, fw: true },
  ];
  const urlSpecs: BoundFieldSpec<ProjectEntry>[] = [
    { f: 'repoUrl', l: t.repoUrl, nul: true, sx: fieldFlexWide },
    { f: 'demoUrl', l: t.demoUrl, nul: true, sx: fieldFlexWide },
  ];
  const metaSpecs: BoundFieldSpec<ProjectEntry>[] = [
    { f: 'category', l: t.category, nul: true, sx: fieldFixed },
    { f: 'stars', l: t.stars, num: true, sx: fieldStars },
  ];

  return (
    <EntryList<ProjectEntry>
      items={value}
      createItem={() => ({
        slug: '',
        title: '',
        summary: '',
        highlights: [],
        repoUrl: null,
        demoUrl: null,
        featured: false,
        technologies: [],
        topics: [],
        category: null,
        stars: null,
      })}
      onChange={onChange}
      addLabel={t.add}
      disabled={disabled}
      renderItem={(entry, update) => (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={entry.featured ?? false}
                disabled={disabled}
                onChange={(e) => {
                  update('featured', e.target.checked);
                }}
              />
            }
            label={t.featured}
          />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <BoundFields
              entry={entry}
              update={update}
              specs={titleSpecs}
              disabled={disabled}
            />
          </Stack>
          <BoundFields
            entry={entry}
            update={update}
            specs={summarySpecs}
            disabled={disabled}
          />
          <StringListEditor
            label={t.highlights}
            items={entry.highlights}
            onChange={(highlights) => {
              update('highlights', highlights);
            }}
          />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <BoundFields
              entry={entry}
              update={update}
              specs={urlSpecs}
              disabled={disabled}
            />
            <BoundFields
              entry={entry}
              update={update}
              specs={metaSpecs}
              disabled={disabled}
            />
          </Stack>
          <StringListEditor
            label={t.technologies}
            items={entry.technologies}
            onChange={(technologies) => {
              update('technologies', technologies);
            }}
          />
          <StringListEditor
            label={t.topics}
            items={entry.topics}
            onChange={(topics) => {
              update('topics', topics);
            }}
          />
        </>
      )}
    />
  );
}

interface SkillGroupsEditorProps {
  value: SkillGroup[] | undefined;
  onChange: (groups: SkillGroup[]) => void;
  disabled?: boolean | undefined;
}

export function SkillGroupsEditor({
  value,
  onChange,
  disabled,
}: SkillGroupsEditorProps) {
  const { messages } = useTranslation();
  const t = messages.resumes.skillGroups;

  return (
    <EntryList<SkillGroup>
      items={value}
      createItem={() => ({ category: 'frontend', items: [] })}
      onChange={onChange}
      addLabel={t.add}
      disabled={disabled}
      renderItem={(group, update) => (
        <>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t.category}</InputLabel>
            <Select
              value={group.category}
              label={t.category}
              disabled={disabled}
              onChange={(e) => {
                update('category', e.target.value);
              }}
            >
              {SKILL_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <StringListEditor
            label={t.items}
            items={group.items}
            onChange={(items) => {
              update('items', items);
            }}
          />
        </>
      )}
    />
  );
}
