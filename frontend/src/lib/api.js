const TOKEN_KEY = "kilos_admin_token";

// In development, requests go through the Vite proxy (/api).
// In production, set VITE_API_URL to the deployed backend URL ending in /api.
export const API_BASE = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/$/, "");

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore storage errors */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "status" && value === "all") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function parseError(response) {
  try {
    const data = await response.json();
    return data?.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, params, signal, headers = {} } = options;
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
    method,
    signal,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event("kilos:unauthorized"));
  }

  if (!response.ok) {
    const message = await parseError(response);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function downloadRequest(path, filename, params = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event("kilos:unauthorized"));
  }

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadPdf(id, referenceNo) {
  return downloadRequest(`/admin/submissions/${id}/pdf`, `${referenceNo || "KILOS"}.pdf`);
}

export const api = {
  get: (path, params, options = {}) => apiRequest(path, { ...options, params }),
  post: (path, body, options = {}) => apiRequest(path, { ...options, method: "POST", body }),
  patch: (path, body, options = {}) => apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" }),
};
