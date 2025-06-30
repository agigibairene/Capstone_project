export async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem('REFRESH_TOKEN');
  if (!refresh) return null;

  try {
    const response = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      localStorage.removeItem('REFRESH_TOKEN');
      return null;
    }

    const data = await response.json();
    localStorage.setItem('ACCESS_TOKEN', data.access);
    if (data.refresh) {
      localStorage.setItem('REFRESH_TOKEN', data.refresh);
    }
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

export function validateToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function getUserRole(): string | null {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || localStorage.getItem('role');
  } catch {
    return localStorage.getItem('role');
  }
}