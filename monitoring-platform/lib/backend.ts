export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend request failed (${response.status}): ${text}`);
  }

  return response.json();
}

export async function backendGet<T>(path: string): Promise<T> {
  return backendFetch<T>(path, { method: 'GET', cache: 'no-store' });
}

export async function backendPut<T>(path: string, body: unknown): Promise<T> {
  return backendFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function backendPost<T>(path: string, body: unknown): Promise<T> {
  return backendFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function backendDelete<T>(path: string): Promise<T> {
  return backendFetch<T>(path, { method: 'DELETE' });
}
