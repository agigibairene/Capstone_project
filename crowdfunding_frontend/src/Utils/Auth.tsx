export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');

    const response = await fetch('/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Token refresh failed');
    }

    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch (error) {
    logout();
    throw error;
  }
};