import type { Itinerary } from '@/types';
import { ATTRACTION_BY_ID } from '@/data/attractions';

// ─── ICS (RFC 5545) generator for an Itinerary ──────────────────────────
//
// Each itinerary stop becomes a VEVENT block. We don't have real calendar
// dates from the user, so we anchor day 1 to "tomorrow" in the user's
// local timezone — they can drag-rebase in their calendar app afterward.
// Within each day, events start at the prefs' configured startTime
// (default 08:30) and chain forward by `commute.totalMinutes + stayMinutes`.

const HEADER = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Ookini KOK//Kansai itinerary//ZH',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
];

const FOOTER = ['END:VCALENDAR'];

/** Escape special characters per RFC 5545 §3.3.11 text encoding. */
function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** Fold long lines to <= 75 octets per RFC 5545 §3.1 line folding. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    out.push((i === 0 ? '' : ' ') + line.slice(i, i + 73));
    i += 73;
  }
  return out.join('\r\n');
}

function formatDateTimeLocal(d: Date): string {
  // Local time stamp — no Z suffix, no TZID. Calendar apps interpret as
  // floating time in the user's local zone, which is what we want for
  // a planned trip that the user will reschedule anyway.
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

interface IcsOptions {
  /** Base date for Day 1. Defaults to tomorrow at 09:00 local. */
  startDate?: Date;
  /** Per-day starting time as 'HH:MM'. Defaults to '08:30'. */
  startTime?: string;
  /** Anchor URL inserted into each event's DESCRIPTION. */
  shareUrl?: string;
}

export function itineraryToICS(it: Itinerary, opts: IcsOptions = {}): string {
  const base = opts.startDate ?? (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(8, 30, 0, 0);
    return t;
  })();
  const [sh, sm] = (opts.startTime ?? '08:30').split(':').map((n) => parseInt(n, 10) || 0);

  const lines: string[] = [...HEADER];
  const dtstamp = formatDateTimeLocal(new Date());

  it.days.forEach((day, dayIdx) => {
    const dayStart = new Date(base);
    dayStart.setDate(dayStart.getDate() + dayIdx);
    dayStart.setHours(sh, sm, 0, 0);
    let cursorMs = dayStart.getTime();

    day.stops.forEach((stop, stopIdx) => {
      // Advance cursor by commute time before the stay.
      cursorMs += Math.round((stop.commute?.totalMinutes ?? 0) * 60 * 1000);
      const start = new Date(cursorMs);
      const end = new Date(cursorMs + Math.round(stop.stayMinutes * 60 * 1000));
      cursorMs = end.getTime();

      const a = ATTRACTION_BY_ID[stop.attractionId];
      if (!a) return;

      const summary = `D${dayIdx + 1}/${stopIdx + 1} ${a.name_zh}`;
      const descParts = [a.shortDesc];
      if (a.nearestStation) descParts.push(`最近站：${a.nearestStation}`);
      if (stop.commute && stopIdx > 0) {
        descParts.push(`通勤 ${Math.round(stop.commute.totalMinutes)} 分`);
      }
      if (opts.shareUrl) descParts.push(opts.shareUrl);

      const uid = `${stop.attractionId}-d${dayIdx}-${stopIdx}@ookini-kok`;
      lines.push(
        'BEGIN:VEVENT',
        foldLine(`UID:${uid}`),
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${formatDateTimeLocal(start)}`,
        `DTEND:${formatDateTimeLocal(end)}`,
        foldLine(`SUMMARY:${escapeText(summary)}`),
        foldLine(`DESCRIPTION:${escapeText(descParts.join('\n'))}`),
        foldLine(`GEO:${a.coord[1].toFixed(6)};${a.coord[0].toFixed(6)}`),
        foldLine(`LOCATION:${escapeText(a.name_zh)}`),
        'END:VEVENT',
      );
    });
  });

  lines.push(...FOOTER);
  return lines.join('\r\n') + '\r\n';
}

/** Trigger a browser download of the ICS file. */
export function downloadItineraryICS(it: Itinerary, opts: IcsOptions = {}) {
  const ics = itineraryToICS(it, opts);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `okini-kok-itinerary-${new Date().toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
