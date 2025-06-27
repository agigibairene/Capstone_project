import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  userRole: string;
}

function getUserRole(): string | null {
  return localStorage.getItem('role');
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
      return null;
    }

    const data = await response.json();
    localStorage.setItem('ACCESS_TOKEN', data.access);
    return data.access;
  } catch (error) {
    console.error('Failed to refresh token', error);
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
        setAuthorized(false);
        return;
      }

      const role = getUserRole();

      if (!role || role.toLowerCase() !== userRole.toLowerCase()) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }

    checkAuth();
  }, [userRole]);

  if (authorized === null) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
