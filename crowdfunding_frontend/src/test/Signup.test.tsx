/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signupUser, signupReducer, resetSignupState, logout, clearError, setUserRole, initializeAuth } from '../redux/signup_auth';
import type { AuthState } from '../redux/signup_auth';
import { configureStore } from '@reduxjs/toolkit';

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

const initialState: AuthState = {
  user: null,
  access: null,
  refresh: null,
  loading: false,
  error: null,
  success: false,
};

describe('signupSlice', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('handles signupUser.fulfilled', async () => {
    const user = {
      id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      role: 'Investor',
      phone_number: '123456789',
      organization: 'AgriOrg',
      investor_type: 'Organization',
    };

    const access = 'mock_access';
    const refresh = 'mock_refresh';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user, access, refresh }),
    }));

    const store = configureStore({
      reducer: signupReducer,
    });

    await store.dispatch(signupUser({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      password: 'pass123',
      confirm_password: 'pass123',
      role: 'Investor',
      phone_number: '123456789',
      organization: 'AgriOrg',
      investorType: 'Organization',
    }) as any);

    const state = store.getState();
    expect(state.user?.email).toBe('jane@example.com');
    expect(state.success).toBe(true);
  });

  it('handles signupUser.rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        email: ['email already exists'],
      }),
    }));

    const store = configureStore({ reducer: signupReducer });

    await store.dispatch(signupUser({
      first_name: 'John',
      last_name: 'Doe',
      email: 'exists@example.com',
      password: '123456',
      confirm_password: '123456',
      role: 'Farmer',
      phone_number: '0000000000',
    }) as any);

    const state = store.getState();
    expect(state.error).toContain('already registered');
    expect(state.success).toBe(false);
  });

  it('handles resetSignupState', () => {
    const nextState = signupReducer({
      ...initialState,
      error: 'Something went wrong',
      success: true,
      loading: true,
    }, resetSignupState());

    expect(nextState.loading).toBe(false);
    expect(nextState.success).toBe(false);
    expect(nextState.error).toBeNull();
  });

  it('handles logout', () => {
    localStorage.setItem('ACCESS_TOKEN', 'abc');
    localStorage.setItem('REFRESH_TOKEN', 'xyz');
    localStorage.setItem('role', 'Farmer');

    const nextState = signupReducer({
      ...initialState,
      user: {
        id: 1,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        role: 'Farmer',
        phone_number: '123',
        organization: null,
        investor_type: null,
      },
      access: 'abc',
      refresh: 'xyz',
      success: true,
    }, logout());

    expect(nextState.user).toBeNull();
    expect(localStorage.getItem('ACCESS_TOKEN')).toBeNull();
  });

  it('handles clearError', () => {
    const nextState = signupReducer({ ...initialState, error: 'Oops' }, clearError());
    expect(nextState.error).toBeNull();
  });

  it('handles setUserRole', () => {
    const user = {
      id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      role: 'Farmer',
      phone_number: '123',
      organization: null,
      investor_type: null,
    };

    const nextState = signupReducer({ ...initialState, user }, setUserRole('Investor'));
    expect(nextState.user?.role).toBe('Investor');
    expect(localStorage.getItem('role')).toBe('Investor');
  });

  it('initializes user from token (initializeAuth)', () => {
    const token = btoa(JSON.stringify({
      user_id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '123456',
      organization: 'Org',
      investor_type: 'Individual',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));

    localStorage.setItem('ACCESS_TOKEN', `header.${token}.signature`);
    localStorage.setItem('role', 'Investor');
    const nextState = signupReducer(initialState, initializeAuth());

    expect(nextState.user?.email).toBe('test@example.com');
    expect(nextState.access).toContain('header.');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
