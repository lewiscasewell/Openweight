import {atomWithMMKV} from '.';

export const appStateAtom = atomWithMMKV<{
  isAppLoading: boolean;
}>('appState', {
  isAppLoading: false,
});
