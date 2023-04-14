import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import {setupURLPolyfill} from 'react-native-url-polyfill';
import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV({id: 'supabase-storage'});

const mmkvStorageConfig = {
  setItem: (key: string, data: string) => storage.set(key, data),
  getItem: (key: string) => storage.getString(key),
  removeItem: (key: string) => storage.delete(key),
};

setupURLPolyfill();

export const supabase = createClient(
  Config.REACT_APP_SUPABASE_URL!,
  Config.REACT_APP_SUPABASE_KEY!,
  {
    auth: {
      storage: mmkvStorageConfig,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'supabase.auth.token',
    },
  },
);
