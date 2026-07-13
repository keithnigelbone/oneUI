import { useEffect, useState } from 'react';

/** ISO timestamp embedded in Playwright summary `message` (e.g. `… OK — 2026-05-25T10:05:59.562Z`). */
export function parseReportTimestamp(message: string | null | undefined): Date | null {
  if (!message?.trim()) return null;
  const iso = message.match(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/);
  if (!iso) return null;
  const d = new Date(iso[0]);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Human-readable absolute time, e.g. `25-May-26 3:45 PM`. */
export function formatReportDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' }).replace('.', '');
  const year = date.getFullYear().toString().slice(-2);
  const time = date.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day}-${month}-${year} ${time}`;
}

/** Relative label from a past instant to `now`. */
export function formatRelativeTime(from: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - from.getTime();
  if (diffMs < 0) return 'just now';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? '1 min ago' : `${min} mins ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? '1 hr ago' : `${hr} hrs ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? '1 day ago' : `${day} days ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return week === 1 ? '1 week ago' : `${week} weeks ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return month === 1 ? '1 month ago' : `${month} months ago`;
  const year = Math.floor(day / 365);
  return year === 1 ? '1 year ago' : `${year} years ago`;
}

/** Absolute + relative time without a leading phrase (for labelled rows in the load panel). */
export function formatTimestampValue(at: Date, now: Date = new Date()): string {
  return `${formatReportDate(at)} (${formatRelativeTime(at, now)})`;
}

export function formatLastRunLine(at: Date, now: Date = new Date()): string {
  return `Last run — ${formatTimestampValue(at, now)}`;
}

export function formatFetchedLine(at: Date, now: Date = new Date()): string {
  return `Report fetched — ${formatTimestampValue(at, now)}`;
}

/** Re-render every `intervalMs` so relative timestamps stay current. */
export function useNowTick(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
