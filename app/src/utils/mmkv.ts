import {MMKV} from 'react-native-mmkv';

const mmkvId = 'some-id';

export const someMMKV = new MMKV({id: mmkvId});

export const setValue = (key: string, value: string) => {
  someMMKV.set(key, value);
};
