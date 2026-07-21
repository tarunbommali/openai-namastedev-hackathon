import { api as baseApi, loadAuth as baseLoadAuth, saveAuth as baseSaveAuth } from "../api";

export const loadAuth = baseLoadAuth;
export const saveAuth = baseSaveAuth;

export const clearAuth = () => {
  baseSaveAuth(null);
};

export const getAuthToken = () => {
  const auth = baseLoadAuth();
  return auth?.accessToken;
};

// Re-export the base api fetcher that handles EC2 dynamic ports and refresh tokens
export const api = baseApi;

// Standardized API convenience methods
export const apiClient = {
  get: (endpoint, token) => baseApi(endpoint, { method: "GET" }, token),
  post: (endpoint, body, token) =>
    baseApi(endpoint, { method: "POST", body: JSON.stringify(body) }, token),
  put: (endpoint, body, token) =>
    baseApi(endpoint, { method: "PUT", body: JSON.stringify(body) }, token),
  patch: (endpoint, body, token) =>
    baseApi(endpoint, { method: "PATCH", body: JSON.stringify(body) }, token),
  delete: (endpoint, token) => baseApi(endpoint, { method: "DELETE" }, token),
  upload: (endpoint, formData, token) =>
    baseApi(endpoint, { method: "POST", body: formData }, token),
};
