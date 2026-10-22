/**
 * The application serves Philippine beneficiaries and staff, but Vercel runs
 * in UTC. All reporting boundaries, reference numbers, and exported
 * timestamps are therefore calculated explicitly in Philippine time.
 */
export const APP_TIME_ZONE = "Asia/Manila";

const MANILA_OFFSET = "+08:00";
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pad = (value) => String(value).padStart(2, "0");

/** Returns the calendar year, month (1-12), and day in Philippine time. */
export function manilaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function startOfManilaDay(date = new Date()) {
  const { year, month, day } = manilaParts(date);
  return new Date(`${year}-${pad(month)}-${pad(day)}T00:00:00${MANILA_OFFSET}`);
}

export function startOfManilaMonth(date = new Date()) {
  const { year, month } = manilaParts(date);
  return new Date(`${year}-${pad(month)}-01T00:00:00${MANILA_OFFSET}`);
}

/**
 * Month metadata for dashboard buckets. `monthsAgo` subtracts whole months
 * from the current Philippine month.
 */
export function manilaMonth(monthsAgo = 0, date = new Date()) {
  const { year, month } = manilaParts(date);
  const index = year * 12 + (month - 1) - monthsAgo;
  const targetYear = Math.floor(index / 12);
  const targetMonth = ((index % 12) + 12) % 12;

  return {
    year: targetYear,
    month: targetMonth + 1,
    key: `${targetYear}-${pad(targetMonth + 1)}`,
    label: MONTH_LABELS[targetMonth],
    start: new Date(`${targetYear}-${pad(targetMonth + 1)}-01T00:00:00${MANILA_OFFSET}`),
  };
}

/**
 * Parses a date filter. Date-only values are interpreted as full Philippine
 * calendar days; ISO timestamps are used as provided.
 */
export function parseManilaDate(value, endOfDay = false) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const time = endOfDay ? "23:59:59.999" : "00:00:00";
    const parsed = new Date(`${value}T${time}${MANILA_OFFSET}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Formats a timestamp in Philippine time, regardless of server timezone. */
export function toManilaString(value, options = {}) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-PH", {
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}
