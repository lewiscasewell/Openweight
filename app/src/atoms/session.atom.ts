import {atomWithMMKV} from '.';
import {Session} from '@supabase/supabase-js';

export const sessionAtom = atomWithMMKV<Session | null>('session', null);
