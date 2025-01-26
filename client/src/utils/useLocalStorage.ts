import type { Ref } from 'vue';
import { ref, watch } from 'vue';
import createDebounce from '@/utils/useDebounce';

function useLocalStorage<T> (key: string, defaultValue: T, storageDelay = 0.5): Ref<T> {
  const value = ref(JSON.parse(localStorage.getItem(key)!) ?? defaultValue);

  const storage = createDebounce((storageKey: string, storageValue: T) => {
    localStorage.setItem(storageKey, JSON.stringify(storageValue));
  }, storageDelay);

  watch(value, ((newValue) => storage(key, newValue)), { immediate: true });

  return value;
}

export default useLocalStorage;
