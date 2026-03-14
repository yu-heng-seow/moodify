import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// On web, use localStorage but guard against SSR (no window in Node.js).
// On native, use AsyncStorage (no 2048-byte limit, works on iOS + Android).
const webStorage = {
  getItem: (key: string) =>
    Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
  setItem: (key: string, value: string) =>
    Promise.resolve(typeof window !== 'undefined' ? window.localStorage.setItem(key, value) : undefined),
  removeItem: (key: string) =>
    Promise.resolve(typeof window !== 'undefined' ? window.localStorage.removeItem(key) : undefined),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
