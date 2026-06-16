import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LoginMethod, RegistrationData } from '@/types/auth';

export type UserRole = 'business' | 'employee' | null;

interface AuthState {
  isAuthenticated: boolean;
  authToken: string | null;
  userRole: UserRole;
  loggedInEmployeeId: string | null;
  rememberMe: boolean;
  loginMethod: LoginMethod;
  savedEmail: string;
  savedPhone: string;
  savedEmployeeId: string;
  registration: Partial<RegistrationData>;
  _hasHydrated: boolean;
  setAuthenticated: (value: boolean) => void;
  setAuthToken: (token: string | null) => void;
  setUserRole: (role: UserRole) => void;
  setLoggedInEmployee: (id: string | null) => void;
  setRememberMe: (value: boolean) => void;
  setLoginMethod: (method: LoginMethod) => void;
  setSavedCredentials: (email: string, phone: string) => void;
  setSavedEmployeeContact: (employeeId: string, phone: string) => void;
  updateRegistration: (data: Partial<RegistrationData>) => void;
  resetRegistration: () => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authToken: null,
      userRole: null,
      loggedInEmployeeId: null,
      rememberMe: false,
      loginMethod: 'email',
      savedEmail: '',
      savedPhone: '',
      savedEmployeeId: '',
      registration: {},
      _hasHydrated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setAuthToken: (token) => set({ authToken: token }),
      setUserRole: (role) => set({ userRole: role }),
      setLoggedInEmployee: (id) => set({ loggedInEmployeeId: id }),
      setRememberMe: (value) => set({ rememberMe: value }),
      setLoginMethod: (method) => set({ loginMethod: method }),
      setSavedCredentials: (email, phone) => set({ savedEmail: email, savedPhone: phone }),
      setSavedEmployeeContact: (employeeId, phone) =>
        set({ savedEmployeeId: employeeId, savedPhone: phone }),
      updateRegistration: (data) =>
        set((state) => ({ registration: { ...state.registration, ...data } })),
      resetRegistration: () => set({ registration: {} }),
      logout: () =>
        set({
          isAuthenticated: false,
          authToken: null,
          userRole: null,
          loggedInEmployeeId: null,
        }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'pratham-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        userRole: state.userRole,
        loggedInEmployeeId: state.loggedInEmployeeId,
        rememberMe: state.rememberMe,
        savedEmail: state.savedEmail,
        savedPhone: state.savedPhone,
        savedEmployeeId: state.savedEmployeeId,
        loginMethod: state.loginMethod,
        registration: state.registration,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
