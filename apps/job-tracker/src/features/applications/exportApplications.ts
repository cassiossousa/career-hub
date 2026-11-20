import type {
  Application,
  ApplicationStatus,
} from '../../services/types/application';

function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportApplicationsCsv(
  applications: Application[],
  titleByJobId: Map<number, string>,
): void {
  const header = [
    'id',
    'jobId',
    'title',
    'status',
    'appliedAt',
    'statusChangedAt',
    'createdAt',
    'notes',
  ];
  const rows = applications.map((app) =>
    [
      app.id,
      app.jobId,
      titleByJobId.get(app.jobId) ?? '',
      app.status satisfies ApplicationStatus,
      app.appliedAt,
      app.statusChangedAt,
      app.createdAt,
      app.notes,
    ]
      .map(csvCell)
      .join(','),
  );
  downloadFile(
    `applications-${new Date().toISOString().slice(0, 10)}.csv`,
    [header.join(','), ...rows].join('\n'),
    'text/csv;charset=utf-8',
  );
}

export function exportApplicationsJson(applications: Application[]): void {
  downloadFile(
    `applications-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(applications, null, 2),
    'application/json;charset=utf-8',
  );
}
