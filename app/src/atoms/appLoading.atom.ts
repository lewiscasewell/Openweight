import {atomWithMMKV} from '.';

export const appLoadingAtom = atomWithMMKV<{
  isAppLoading: boolean;
}>('isAppLoading', {
  isAppLoading: false,
});
