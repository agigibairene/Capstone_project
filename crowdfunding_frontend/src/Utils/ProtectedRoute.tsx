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
    const response = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      console.error('Refresh token invalid or expired');
      localStorage.clear(); 
      return null;
    }

    const data = await response.json();
    localStorage.setItem('ACCESS_TOKEN', data.access);
    return data.access;
  } catch (error) {
    console.error('Failed to refresh token', error);
    localStorage.clear();
    return null;
  }
}

function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role || null;
    if (role && role !== 'undefined') {
      localStorage.setItem('role', role);
      return role;
    }
    return null;
  } catch {
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
      const role = roleFromToken || (storedRole !== 'undefined' ? storedRole : null);

      console.log('ProtectedRoute: Role check', {
        roleFromToken,
        roleFromStorage: storedRole,
        finalRole: role,
        requiredRole: userRole
      });

      if (!role || role === 'undefined') {
        console.log('ProtectedRoute: No valid role found');
        setAuthorized(false);
        return;
      }

      if (role.toLowerCase() !== userRole.toLowerCase()) {
        console.log('ProtectedRoute: Role mismatch');
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
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