import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

export default function KYC({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.signupReducer);
  const { loading, error, success } = useSelector((state: RootState) => state.kycReducer);

  useEffect(() => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const storedRole = localStorage.getItem('role');
    
    // Get role from multiple sources
    const userRole = user?.role || storedRole;
    
    // Try to get role from token if other sources fail
    let tokenRole = null;
    if (token && (!userRole || userRole === 'undefined')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        tokenRole = payload.role;
        if (tokenRole && tokenRole !== 'undefined') {
          localStorage.setItem('role', tokenRole);
        }
      } catch (e) {
        console.error('KYC: Failed to decode token', e);
      }
    }

    const finalRole = userRole || tokenRole;

    console.log('KYC: Current state:', { 
      user: !!user, 
      token: !!token, 
      userRole,
      storedRole,
      tokenRole,
      finalRole,
      loading, 
      error, 
      success,
      pathname: location.pathname
    });

    // If no authentication at all, redirect to signup
    if (!user && !token && !loading && location.pathname.includes('kyc')) {
      console.log('KYC: No user or token found, redirecting to signup');
      navigate('/signup');
      return;
    }

    // Handle session expiry
    if (error) {
      if (typeof error === 'string' && error.includes('Session expired')) {
        console.log('KYC: Session expired, clearing storage and redirecting to login');
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('REFRESH_TOKEN');
        localStorage.removeItem('role');
        navigate('/login');
      }
      return;
    }

    // If token exists but no user state and not loading, might need to refresh
    if (token && !user && !loading && !success) {
      console.log('KYC: Token exists but no user state, redirecting to login for re-authentication');
      navigate('/login');
      return;
    }

    // Handle successful KYC submission
    if (success && !loading) {
      console.log('KYC: Successful submission, preparing redirect', { 
        finalRole,
        isValidRole: finalRole && finalRole !== 'undefined'
      });

      if (finalRole && finalRole !== 'undefined') {
        const normalizedRole = finalRole.toLowerCase();
        if (normalizedRole === 'investor') {
          console.log('KYC: Redirecting to investor dashboard');
          navigate('/investor', { replace: true });
        } else if (normalizedRole === 'farmer') {
          console.log('KYC: Redirecting to farmer dashboard');
          navigate('/farmer', { replace: true });
        } else {
          console.error('KYC: Unknown role:', finalRole);
          navigate('/login');
        }
      } else {
        console.error('KYC: No valid role found after successful submission');
        // Clear invalid data and redirect to login
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('REFRESH_TOKEN');
        localStorage.removeItem('role');
        navigate('/login');
      }
    }
  }, [user, navigate, loading, location.pathname, error, success]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing KYC submission...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}