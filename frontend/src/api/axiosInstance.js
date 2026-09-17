import axios from "axios";
import { readUser, saveUser } from "./session";

const options = {
  // CloudFront (or the legacy Vercel proxy) keeps /api cookies first-party.
  // Preserve the current local backend port for development.
  baseURL: process.env.NODE_ENV === "production" ? "" : "http://localhost:5100",
  withCredentials: true,
  timeout: 90000,
  headers: { "X-Requested-With": "ChatApp" },
};
const instance = axios.create(options);
const sessionClient = axios.create(options);
let refreshPromise;
let sessionVersion = 0;

export function acceptLogin(user) {
  sessionVersion += 1;
  saveUser(user);
}

function expireSession() {
  sessionVersion += 1;
  saveUser(null);
}

// Other tabs share cookies and storage; discard results for a different login.
window.addEventListener("storage", (event) => {
  if (event.key === null) { sessionVersion += 1; return; }
  if (event.key === "userInfo") {
    try {
      const previous = JSON.parse(event.oldValue);
      const current = JSON.parse(event.newValue);
      if (!previous || !current || previous._id !== current._id) sessionVersion += 1;
    } catch { sessionVersion += 1; }
  }
});

export async function logout() {
  sessionVersion += 1;
  // Keep the UI logged in on a network failure so logout can be retried.
  await sessionClient.post("/api/user/logout");
  expireSession();
}

function refreshAccessToken() {
  if (!refreshPromise) {
    const version = sessionVersion;
    const user = readUser();
    refreshPromise = sessionClient.post("/api/user/refresh")
      .then(({ data }) => {
        if (version !== sessionVersion || !user || !readUser()) {
          throw new Error("Login session changed while refreshing.");
        }
        saveUser({ ...readUser(), token: data.token });
        return data.token;
      })
      .catch((error) => {
        // A sleeping backend or database outage must not discard a valid login.
        if (version === sessionVersion && error.response?.status === 401) expireSession();
        throw error;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

instance.interceptors.request.use((config) => {
  const user = readUser();
  config._sessionVersion = sessionVersion;
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  else delete config.headers.Authorization;
  return config;
});

instance.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  const code = error.response?.data?.code;
  const authRequest = /^\/api\/user\/(login|refresh|logout)\/?$/.test(request?.url || "") ||
    (request?.method === "post" && /^\/api\/user\/?$/.test(request?.url || ""));
  if (!request || authRequest || error.response?.status !== 401) throw error;
  if (request._sessionVersion !== sessionVersion) throw error;
  if (request._retried || !["TOKEN_EXPIRED", "TOKEN_INVALID", "AUTH_REQUIRED"].includes(code)) {
    expireSession();
    throw error;
  }
  request._retried = true;
  // Another request may already have renewed the token before this 401 arrived.
  const current = readUser()?.token;
  if (!current || request.headers.Authorization === `Bearer ${current}`) {
    await refreshAccessToken();
  }
  return instance(request);
});

export default instance;
