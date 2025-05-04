export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type TokenType = "token" | "refresh_token";
function getToken(type: TokenType) {
  return localStorage.getItem(type) ?? sessionStorage.getItem(type);
}
function setToken(type: TokenType, value: string, remember = false) {
  if (remember) {
    localStorage.setItem(type, value);
    sessionStorage.removeItem(type);
  } else {
    sessionStorage.setItem(type, value);
    localStorage.removeItem(type);
  }
}
function removeTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refresh_token");
}

export async function makeApiRequest(
  endpoint: string,
  method: string,
  body?: any,
  skipAuth = false,
  retry = true,
) {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = getToken("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    headers,
    body: body != null ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { detail: res.statusText };
    }
    const code = typeof err.detail === "string" ? err.detail : err.detail?.code;
    if (
      !skipAuth &&
      retry &&
      res.status === 401 &&
      (code === "token_expired" || code === "invalid_token")
    ) {
      const refreshToken = getToken("refresh_token");
      if (refreshToken) {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setToken("token", data.access_token, !!localStorage.getItem("token"));
          if (data.refresh_token) {
            setToken("refresh_token", data.refresh_token, !!localStorage.getItem("refresh_token"));
          }
          return makeApiRequest(endpoint, method, body, skipAuth, false);
        } else {
          removeTokens();
        }
      } else {
        removeTokens();
      }
    }
    const e: any = new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.code || err.message || "Request failed",
    );
    e.status = res.status;
    throw e;
  }

  return res.json();
}

export { getToken, setToken, removeTokens };
