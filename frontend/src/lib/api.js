const ACCESS_TOKEN_KEY = "kilos_access_token";
const REFRESH_TOKEN_KEY = "kilos_refresh_token";

// In development, requests go through the Vite proxy (/api).
// In production, set VITE_API_URL to the deployed backend URL ending in /api.
export const API_BASE = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/$/, "");

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    /* ignore storage errors */
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setRefreshToken(token) {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    /* ignore storage errors */
  }
}

export function clearRefreshToken() {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

export function clearTokens() {
  clearAccessToken();
  clearRefreshToken();
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

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  if (isRefreshing) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        throw new Error("Refresh failed.");
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return data;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, params, signal, headers = {} } = options;
  const accessToken = getAccessToken();
  const response = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
    method,
    signal,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // If 401 and we have a refresh token, try to refresh and retry once
  if (response.status === 401 && accessToken) {
    try {
      await refreshAccessToken();
      const newAccessToken = getAccessToken();
      const retryResponse = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
        method,
        signal,
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : {}),
          ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (retryResponse.status === 401) {
        clearTokens();
        window.dispatchEvent(new Event("kilos:unauthorized"));
        const message = await parseError(retryResponse);
        const error = new Error(message);
        error.status = retryResponse.status;
        throw error;
      }
      if (!retryResponse.ok) {
        const message = await parseError(retryResponse);
        const error = new Error(message);
        error.status = retryResponse.status;
        throw error;
      }
      if (retryResponse.status === 204) return null;
      return retryResponse.json();
    } catch (err) {
      if (err.message === "Refresh failed." || err.message === "No refresh token available.") {
        clearTokens();
        window.dispatchEvent(new Event("kilos:unauthorized"));
      }
      throw err;
    }
  }

  if (response.status === 401) {
    clearTokens();
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
  const accessToken = getAccessToken();
  const response = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (response.status === 401 && accessToken) {
    clearTokens();
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
