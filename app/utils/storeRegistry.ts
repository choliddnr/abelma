export interface ResettableStore {
  reset: () => void;
}

const registry = new Set<ResettableStore>();

/**
 * Registers a store to be reset automatically when the active profile changes.
 */
export const registerProfileStore = (store: ResettableStore) => {
  registry.add(store);
};

/**
 * Resets all registered stores to their initial state.
 */
export const resetAllProfileStores = () => {
  registry.forEach((store) => {
    try {
      store.reset();
    } catch (e) {
      console.error("Failed to reset store:", e);
    }
  });
};
