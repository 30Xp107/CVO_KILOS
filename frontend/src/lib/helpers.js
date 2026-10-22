import { LABELS, label as labelOf, labels as labelsOf, yesNo } from "../../shared/labels.js";

export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function label(map, value, fallback = "") {
  return labelOf(map, value, fallback);
}

export function labels(map, values = []) {
  return labelsOf(map, values);
}

export function joinLabels(map, values = [], fallback = "None provided") {
  const result = labelsOf(map, values);
  return result.length ? result.join(", ") : fallback;
}

export { LABELS, yesNo };

export function setNestedValue(object, path, value) {
  const keys = path.split(".");
  const clone = Array.isArray(object) ? [...object] : { ...object };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = cursor[key];
    cursor[key] = Array.isArray(next) ? [...next] : { ...(next || {}) };
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

export function getNestedValue(object, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), object);
}

export function toggleInArray(values = [], value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatBirthday(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function numberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export const STATUS_META = {
  new: { label: "New", className: "status-new", description: "Submitted, awaiting review" },
  in_review: { label: "In Review", className: "status-review", description: "Being processed by staff" },
  referred: { label: "Referred", className: "status-referred", description: "Referred to a partner agency" },
  completed: { label: "Completed", className: "status-completed", description: "Assistance completed" },
};
