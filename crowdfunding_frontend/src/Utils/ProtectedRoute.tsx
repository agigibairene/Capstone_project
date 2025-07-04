import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  userRole: string;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem('REFRESH_TOKEN');
  if (!refresh) {
    console.error('No refresh token found');
    return null;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
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

  useEffect(() => {
    async function checkAuth() {
    let access = localStorage.getItem('ACCESS_TOKEN');

    if (!access) {
      access = await refreshAccessToken();
    }

    if (!access) {
      console.log('ProtectedRoute: No valid access token');
      setAuthorized(false);
      return;
    }

    const roleFromToken = getUserRoleFromToken(access);
    const storedRole = localStorage.getItem('role');
    
    // Clean the stored role value
    let role = roleFromToken;
    if (!role && storedRole && storedRole !== 'undefined' && storedRole !== 'null') {
      role = storedRole;
    }

    console.log('ProtectedRoute: Role check', {
      roleFromToken,
      roleFromStorage: storedRole,
      finalRole: role,
      requiredRole: userRole
    });

    if (!role) {
      console.log('ProtectedRoute: No valid role found');
      setAuthorized(false);
      return;
    }

    // Normalize roles for comparison
    const normalizedRole = role.toLowerCase();
    const normalizedRequired = userRole.toLowerCase();

    setAuthorized(normalizedRole === normalizedRequired);
  }

  checkAuth();
}, [userRole]);

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