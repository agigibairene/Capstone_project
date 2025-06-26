import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";


interface JwtPayload {
  exp: number;
}

interface Props {
  children: React.ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN = 'access'
const REFRESH_TOKEN = 'refresh'

export default function ProtectedRoute({ children }: Props){
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) {
      setIsAuthorized(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) throw new Error("Failed to refresh token");

      const data = await res.json();
      localStorage.setItem(ACCESS_TOKEN, data.access);
      setIsAuthorized(true);
    } catch (error) {
      console.error("Refresh token error:", error);
      setIsAuthorized(false);
    }
  };

  const checkAuth = async () => {
    const access = localStorage.getItem(ACCESS_TOKEN);
    if (!access) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(access);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        await refreshAccessToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" replace />;
};


