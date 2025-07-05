import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_URL } from './constants';


interface Props {
  children: React.ReactNode;
  userRole: string;
}

async function refreshAccessToken(): Promise<string | null | 'expired'> {
  const refresh = localStorage.getItem('REFRESH_TOKEN');
  if (!refresh) {
    return 'expired';
  }

  try {
    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (
        data?.detail === 'Token is invalid or expired' ||
        data?.detail === 'Session expired. Please login again.'
      ) {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('REFRESH_TOKEN');
        localStorage.removeItem('role');
        return 'expired';
      }

      throw new Error(data?.detail || 'Refresh failed');
    }

    localStorage.setItem('ACCESS_TOKEN', data.access);
    if (data.refresh) {
      localStorage.setItem('REFRESH_TOKEN', data.refresh);
    }

    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return 'expired';
  }
}


function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload?.role || payload?.user_role || payload?.profile?.role || null;

    if (role && typeof role === 'string' && role.trim().length > 0 && role !== 'undefined') {
      const normalizedRole = role.toLowerCase().trim();
      localStorage.setItem('role', normalizedRole);
      return normalizedRole;
    }
    return null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export default function ProtectedRoute({ children, userRole }: Props) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      let access = localStorage.getItem('ACCESS_TOKEN');

      if (!access) {
        const refreshed = await refreshAccessToken();
        if (refreshed === 'expired') {
          console.log('Session expired. Redirecting to home.');
          navigate('/', { replace: true });
          return;
        }
        access = refreshed;
      }

      if (!access) {
        setAuthorized(false);
        return;
      }

      const roleFromToken = getUserRoleFromToken(access);
      const storedRole = localStorage.getItem('role');

      let role = roleFromToken;
      if (!role && storedRole && storedRole !== 'undefined' && storedRole !== 'null') {
        role = storedRole;
      }

      if (!role) {
        setAuthorized(false);
        return;
      }

      const normalizedRole = role.toLowerCase();
      const normalizedRequired = userRole.toLowerCase();

      setAuthorized(normalizedRole === normalizedRequired);
    }

    checkAuth();
  }, [userRole, navigate]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}