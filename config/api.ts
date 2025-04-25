export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function makeApiRequest(
  endpoint: string,
  method: string,
  body?: any,
  skipAuth = false,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!skipAuth) {
    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token");

    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json();
    const e: any = new Error(
      typeof err.detail === "string"
        ? err.detail
        : err.detail?.code || err.message || "Request failed",
    );

    throw e;
  }

  return res.json();
}
