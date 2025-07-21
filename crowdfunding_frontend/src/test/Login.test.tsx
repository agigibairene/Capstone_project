/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginUser, logout, setAuthTokens, initializeAuth, loginReducer } from '../redux/login_auth';
import { configureStore } from '@reduxjs/toolkit';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const REFRESH_TOKEN = 'REFRESH_TOKEN';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const sampleUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  date_joined: '2023-01-01',
  profile: {
    phone_number: '1234567890',
    role: 'Farmer',
    organization: 'FarmCo',
    investor_type: null,
  }
};

describe('loginSlice', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('handles successful login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: sampleUser,
        success: true,
      }),
    }));

    const store = configureStore({ reducer: loginReducer });

    await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }) as any);
    const state = store.getState();

    expect(state.user?.email).toBe('test@example.com');
    expect(state.access).toBe('mock-access-token');
    expect(state.refresh).toBe('mock-refresh-token');
    expect(localStorage.getItem(ACCESS_TOKEN)).toBe('mock-access-token');
  });

  it('handles login requiring OTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        requires_otp: true,
        username: 'otpuser',
        success: true,
      }),
    }));

    const store = configureStore({ reducer: loginReducer });

    const action: any = await store.dispatch(loginUser({ email: 'otp@example.com', password: 'pass' }) as any);

    expect(action.payload.requires_otp).toBe(true);
    expect(action.payload.username).toBe('otpuser');
    expect(store.getState().user).toBe(null); 
  });

  it('handles login failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        detail: 'Invalid credentials',
      }),
    }));

    const store = configureStore({ reducer: loginReducer });

    await store.dispatch(loginUser({ email: 'fail@example.com', password: 'wrong' }) as any);
    const state = store.getState();

    expect(state.error).toBe('Invalid credentials');
    expect(state.user).toBe(null);
  });

  it('logout clears state and localStorage', () => {
    localStorage.setItem(ACCESS_TOKEN, 'token');
    localStorage.setItem(REFRESH_TOKEN, 'refresh');
    localStorage.setItem('role', 'Farmer');

    const nextState = loginReducer({
      user: sampleUser,
      access: 'token',
      refresh: 'refresh',
      loading: false,
      error: null
    }, logout());

    expect(nextState.user).toBeNull();
    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });

  it('setAuthTokens updates state and localStorage', () => {
    const nextState = loginReducer({
      user: null,
      access: null,
      refresh: null,
      loading: false,
      error: null
    }, setAuthTokens({
      user: sampleUser,
      access: 'token123',
      refresh: 'refresh456',
    }));

    expect(nextState.user?.username).toBe('testuser');
    expect(localStorage.getItem(ACCESS_TOKEN)).toBe('token123');
    expect(localStorage.getItem('role')).toBe('Farmer');
  });

  it('initializeAuth sets user from valid token', () => {
    const payload = {
      user_id: 1,
      email: 'test@example.com',
      username: 'jwtuser',
      first_name: 'JWT',
      last_name: 'User',
      date_joined: '2023-01-01',
      phone_number: '111222333',
      organization: 'Org',
      investor_type: 'Individual',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem(ACCESS_TOKEN, token);
    localStorage.setItem(REFRESH_TOKEN, 'refresh-token');
    localStorage.setItem('role', 'Investor');

    const newState = loginReducer({
      user: null,
      access: null,
      refresh: null,
      loading: false,
      error: null
    }, initializeAuth());

    expect(newState.user?.email).toBe('test@example.com');
    expect(newState.access).toBe(token);
  });

  it('initializeAuth clears expired token', () => {
    const payload = {
      exp: Math.floor(Date.now() / 1000) - 10,
    };

    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem(ACCESS_TOKEN, token);
    localStorage.setItem(REFRESH_TOKEN, 'refresh-token');
    localStorage.setItem('role', 'Investor');

    const newState = loginReducer(undefined, initializeAuth());

    expect(newState.user).toBeNull();
    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
