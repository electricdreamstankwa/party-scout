import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// AsyncStorage breaks on web — only use it on native
const authOptions = Platform.OS === 'web'
  ? { autoRefreshToken: true, persistSession: false, detectSessionInUrl: false }
  : (() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false };
    })();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authOptions,
});
