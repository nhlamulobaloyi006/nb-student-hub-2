import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const REGISTRY_KEY = 'nb_users_registry';
const USER_KEY     = 'nb_user';       // localStorage when "remember me"
const USER_KEY_S   = 'nb_user';       // sessionStorage when not

/**
 * Demo-only password hash.
 * NOT cryptographically secure — this app has no backend, no network,
 * and no real secrets. Do not reuse this pattern in production.
 */
function demoHash(input) {
  const salt = 'nb_hub_v2';
  let h = 5381;
  const s = salt + '::' + input;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return 'h_' + (h >>> 0).toString(36);
}

/** Simple email shape check — good enough for a localStorage-only app. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(raw) {
  const e = (raw || '').trim();
  if (!e) throw new Error('Email is required.');
  if (!EMAIL_RE.test(e)) throw new Error('Please enter a valid email address.');
  return e.toLowerCase();
}

function validateName(raw) {
  const n = (raw || '').trim();
  if (!n) throw new Error('Please enter your name.');
  if (n.length < 2) throw new Error('Name must be at least 2 characters.');
  return n;
}

function validatePassword(raw) {
  const p = raw || '';
  if (!p) throw new Error('Password is required.');
  if (p.length < 6) throw new Error('Password must be at least 6 characters.');
  return p;
}

function safeParse(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function readRegistry() {
  return safeParse(localStorage.getItem(REGISTRY_KEY)) || [];
}

function writeRegistry(list) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(list));
}

function readStoredUser() {
  return (
    safeParse(localStorage.getItem(USER_KEY)) ||
    safeParse(sessionStorage.getItem(USER_KEY_S)) ||
    null
  );
}

function makeDefaultUser({ name, email, passwordHash }) {
  return {
    name,
    email,
    passwordHash,
    stream: '',
    subjects: { homeLanguage: '', fal: '', mathematics: '', electives: [] },
    interests: [],
    aps: 0,
    subjectMarks: {},
    onboardingComplete: false,
    savedItems: [],
    futureGoal: '',
    applications: [],
    wellness: { checkins: [], privacyAcknowledged: true },
    streaks: {
      current: 0,
      longest: 0,
      checkins: [],
      brokenStreak: null,
      graceDayLastUsed: null,
      lastGraceDay: null,
      comebackEarned: false,
    },
    preferences: {
      notifications: true,
      notificationsBrowser: false,
      lastNotified: {},
      dataSaver: false,
      province: '',
      accommodation: '',
      studyMode: 'Full-time',
    },
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const persistUser = useCallback((next, remember) => {
    const payload = JSON.stringify(next);
    if (remember) {
      localStorage.setItem(USER_KEY, payload);
      sessionStorage.removeItem(USER_KEY_S);
    } else {
      sessionStorage.setItem(USER_KEY_S, payload);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const signUp = useCallback(({ name, email, password }) => {
    const cleanName = validateName(name);
    const cleanEmail = validateEmail(email);
    validatePassword(password);

    const registry = readRegistry();
    if (registry.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with that email already exists.');
    }

    const newUser = makeDefaultUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash: demoHash(password),
    });
    registry.push(newUser);
    writeRegistry(registry);
    persistUser(newUser, true);
    setUser(newUser);
    return newUser;
  }, [persistUser]);

  const signIn = useCallback(({ email, password, remember = false }) => {
    const cleanEmail = validateEmail(email);
    if (!password) throw new Error('Password is required.');

    const registry = readRegistry();
    const found = registry.find((u) => u.email === cleanEmail);
    if (!found) throw new Error('No account found with that email.');
    if (found.passwordHash !== demoHash(password)) {
      throw new Error('Incorrect password. Please try again.');
    }
    persistUser(found, remember);
    setUser(found);
    return found;
  }, [persistUser]);

  const signOut = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY_S);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      const registry = readRegistry();
      const idx = registry.findIndex((u) => u.email === next.email);
      if (idx >= 0) {
        registry[idx] = next;
        writeRegistry(registry);
      }
      const inLocal = !!localStorage.getItem(USER_KEY);
      persistUser(next, inLocal);
      return next;
    });
  }, [persistUser]);

  const deleteAccount = useCallback(() => {
    if (!user) return;
    const registry = readRegistry().filter((u) => u.email !== user.email);
    writeRegistry(registry);
    signOut();
  }, [user, signOut]);

  const value = useMemo(() => ({
    user,
    ready,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateUser,
    deleteAccount,
  }), [user, ready, signUp, signIn, signOut, updateUser, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}