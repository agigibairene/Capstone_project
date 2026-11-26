import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { refreshAccessToken, fetchCurrentUser, logoutUser } from '../redux/login_auth';            
import { logout as signupLogout } from '../redux/signup_auth'; 
import type { KYCState } from '../redux/KycSlice';


// Login returns user.profile.role; signup returns user.role
const getRole = (u: unknown): string | undefined => {
  const x = u as { role?: string; profile?: { role?: string } } | null;
  return x?.profile?.role ?? x?.role;
};

export default function KYC({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loginState = useSelector((s: RootState) => s.loginReducer);
  const signupState = useSelector((s: RootState) => s.signupReducer);
  const { loading, error, success } = useSelector((s: RootState) => s.kycReducer as KYCState);

  const user = loginState.user ?? signupState.user;
  const access = loginState.access ?? signupState.access;

  const [ready, setReady] = useState(false);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        if (!access) await dispatch(refreshAccessToken()).unwrap(); 
        if (!user) await dispatch(fetchCurrentUser()).unwrap();     
        setReady(true);
      } catch {
        navigate('/login', { replace: true });
      }
    })();
  }, []);

  useEffect(() => {
    if (error && /expired/i.test(error)) {
      dispatch(logoutUser());   
      dispatch(signupLogout()); 
      navigate('/login', { replace: true });
    }
  }, [error, dispatch, navigate]);

  // Redirect after successful KYC submission
  useEffect(() => {
    if (!success || loading) return;

    const role = getRole(user)?.toLowerCase();
    if (role === 'investor') navigate('/investor', { replace: true });
    else if (role === 'farmer') navigate('/farmer', { replace: true });
    else navigate('/login', { replace: true });
  }, [success, loading, user, navigate]);

  if (!ready) return null; 

  return <>{children}</>;
}