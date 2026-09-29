export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateDaysBetween(startDateISO: string, endDateISO: string): number {
  if (!startDateISO || !endDateISO) return 1;
  const start = parseDateISO(startDateISO);
  const end = parseDateISO(endDateISO);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

export function calculateEndDate(startDateISO: string, totalDays: number): string {
  if (!startDateISO) return '';
  const start = parseDateISO(startDateISO);
  const end = addDays(start, Math.max(0, totalDays - 1));
  return formatDateISO(end);
}

export function formatDisplayDate(dateISO: string): string {
  if (!dateISO) return '';
  try {
    const date = parseDateISO(dateISO);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateISO;
  }
}

export function isToday(dateISO: string): boolean {
  if (!dateISO) return false;
  const today = formatDateISO(new Date());
  return today === dateISO;
}
