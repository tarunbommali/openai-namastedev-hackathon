const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const AUTH_KEY = "hireflow.auth";

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (!auth) localStorage.removeItem(AUTH_KEY);
  else localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

let refreshPromise = null;

async function refreshAccessToken() {
  const auth = loadAuth();
  if (!auth?.refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: auth.refreshToken })
    })
      .then(async (res) => {
        if (!res.ok) {
          saveAuth(null);
          return null;
        }
        const data = await res.json();
        const next = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user || auth.user
        };
        saveAuth(next);
        return next;
      })
      .catch(() => {
        saveAuth(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api(path, options = {}, token) {
  const auth = loadAuth();
  const access = token || auth?.accessToken;
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(access ? { Authorization: `Bearer ${access}` } : {})
  };

  let response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach API at ${API}. Start Express: cd backend/express && npm run dev`);
  }

  if (response.status === 401 && auth?.refreshToken && !path.includes("/auth/")) {
    const next = await refreshAccessToken();
    if (next?.accessToken) {
      return api(path, options, next.accessToken);
    }
    throw new Error("Session expired — please sign in again");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Request failed (${response.status}): ${path}`);
  }
  return response.json();
}

export { API, AUTH_KEY };
