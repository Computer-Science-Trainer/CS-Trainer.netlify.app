export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function makeApiRequest(
  endpoint: string,
  method: string,
  body?: any,
  skipAuth = false,
) {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};

  // For JSON body, set JSON header; for FormData let browser set multipart boundary
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token");

    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    headers,
    // Use raw FormData if needed, otherwise stringify
    body: body != null ? (isFormData ? body : JSON.stringify(body)) : undefined,
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
