// auth_storage.ts - Create this utility file
export const authStorage = {
  setTokens: (access: string, refresh: string, role: string) => {
    try {
      localStorage.setItem('ACCESS_TOKEN', access);
      localStorage.setItem('REFRESH_TOKEN', refresh);
      localStorage.setItem('role', role);
      console.log('Auth tokens stored successfully:', { 
        access: access.substring(0, 20) + '...', 
        role 
      });
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  },

  getAccessToken: (): string | null => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
      if (!token || token === 'undefined' || token === 'null') {
        console.warn('No valid access token found');
        return null;
      }
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  getRefreshToken: (): string | null => {
    try {
      const token = localStorage.getItem('REFRESH_TOKEN');
      if (!token || token === 'undefined' || token === 'null') {
        return null;
      }
      return token;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  getRole: (): string | null => {
    try {
      const role = localStorage.getItem('role');
      if (!role || role === 'undefined' || role === 'null') {
        return null;
      }
      return role;
    } catch (error) {
      console.error('Failed to get role:', error);
      return null;
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
      localStorage.removeItem('role');
      console.log('All auth data cleared');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp <= currentTime;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  }
};