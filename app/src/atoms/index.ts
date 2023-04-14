import {atomWithStorage, createJSONStorage} from 'jotai/utils';
import {MMKV} from 'react-native-mmkv';
import superjson from 'superjson';

export const jotaiStorage = new MMKV({id: 'jotai-storage'});

function getItem<T>(key: string): T | null {
  const value = jotaiStorage.getString(key);
  return value ? superjson.parse(value) : null;
}

function setItem<T>(key: string, value: T): void {
  jotaiStorage.set(key, superjson.stringify(value));
}

function removeItem(key: string): void {
  jotaiStorage.delete(key);
}

function clearAll(): void {
  jotaiStorage.clearAll();
}

export const atomWithMMKV = <T>(key: string, initialValue: T) =>
  atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => ({
      getItem,
      setItem,
      removeItem,
      clearAll,
    })),
  );
