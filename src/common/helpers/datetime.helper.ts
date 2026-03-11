export function getCurrentDate() {
  const now = new Date();
  const dateParts: any = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = dateParts.find((p: any) => p.type === 'year').value;
  const month = dateParts.find((p: any) => p.type === 'month').value;
  const day = dateParts.find((p: any) => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

export function getYear() {
  const now = new Date();
  const dateParts: any = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = dateParts.find((p: any) => p.type === 'year').value;
  return year;
}

export function getCurrentTime() {
  const now = new Date();
  const timeParts: any = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now);

  const hour = timeParts.find((p: any) => p.type === 'hour').value;
  const minute = timeParts.find((p: any) => p.type === 'minute').value;
  const second = timeParts.find((p: any) => p.type === 'second').value;
  return `${hour}:${minute}:${second}`;
}

export function getPreviousDate(baseDateStr: string) {
  const baseStr = baseDateStr || getCurrentDate();
  const base = new Date(`${baseStr}T12:00:00-05:00`);
  const prev = new Date(base.getTime() - 24 * 60 * 60 * 1000);
  const dateParts: any = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(prev);
  const year = dateParts.find((p: any) => p.type === 'year').value;
  const month = dateParts.find((p: any) => p.type === 'month').value;
  const day = dateParts.find((p: any) => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

export function getNextDate(baseDateStr: string) {
  const baseStr = baseDateStr || getCurrentDate();
  const base = new Date(`${baseStr}T12:00:00-05:00`);
  const next = new Date(base.getTime() + 24 * 60 * 60 * 1000);
  const dateParts: any = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(next);
  const year = dateParts.find((p: any) => p.type === 'year').value;
  const month = dateParts.find((p: any) => p.type === 'month').value;
  const day = dateParts.find((p: any) => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}
