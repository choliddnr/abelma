---
name: pinia-state-management
description: Generate and manage state in Nuxt applications using Pinia with setup-style stores (Composition API).
---

## 🧭 Core Rules

### ✅ Always Use Setup Store Syntax

```ts
export const useExampleStore = defineStore("example", () => {
  const count = ref(0);

  const double = computed(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  return {
    count,
    double,
    increment,
  };
});
```

❌ Never Use Option Store Syntax

Avoid:

```ts
defineStore({
  state: () => ({}),
  getters: {},
  actions: {},
});
```

⚡ Use Composition API

1. ref → state
2. computed → getters
3. functions → actions

🔁 Store Usage in Components

```vue
<script setup lang="ts">
const { count } = storeToRefs(useExampleStore());
const { increment } = useExampleStore();
</script>

<template>
  <div>{{ count }}</div>
  <button @click="increment">Increment</button>
</template>
```

🌐 Nuxt-Specific Behavior

fetching and sync data from api

```vue
// vue component at folder pages
<script setup lang="ts">
const { someState } = storeToRefs(useExampleStore());
const { fetchSomeState } = useExampleStore();
// use $fetch to fetch data from api (without SSR)
await $fetch("/api/someendpoint", {
  onResponse: ({ response }) => {
    if (response.ok) {
      someState.value = response.data;
    } else {
      // error handling here
    }
  },
});
// or
await fetchSomeState();

// with ssr
await useAsyncData("someState", async () => {
  // fetching and sync logic here. prevent double fetching
});

// to make sure it call only once (preent refetch when navigating back and forth)
await callOnce(async () => {
  // fetch logic here
});

const { count } = storeToRefs(useExampleStore());
const { increment } = useExampleStore();
</script>

<template>
  <div>{{ count }}</div>
  <button @click="increment">Increment</button>
</template>
```

✅ Assume Auto Imports

1. defineStore
2. ref, computed, watch

⚠️ SSR Safety

Avoid direct browser API usage.

Use:

```ts
if (process.client) {
  localStorage.setItem("key", "value");
}
```

🔄 Async Actions

```ts
const fetchData = async () => {
  const data = await $fetch("/api/data");
  items.value = data;
};
```

🔗 Cross Store (nested) Usage

```ts
const { count } = storeToRefs(useExampleStore());
const { doSomething } = useOtherStore();

count.value++;
doSomething();
```

💾 Persistence Pattern

use `pinia-plugin-unstorage` (The best persistence plugin for pinia).

The persistence logic of this plugin is implemented based on unstorage, which provide unified key-value storage API. Based on this, you can even persist the data to the database

Install `pnpm add pinia-plugin-unstorage`
Usage Nuxt app

```ts
export default defineNuxtConfig({
  modules: ["@pinia/nuxt", "pinia-plugin-unstorage/nuxt"],
  piniaUnstorage: {
    // UnstorageOptions
  },
});
```

Options
Plugin options

```ts
interface UnstorageOptions {
  namespace: string; // prefix str to as storage key
  driver: Driver | (() => Driver); // the storage instance in unstorage
}
```

Store options

```ts
export const useStore = defineStore(
  "store",
  () => {
    // ...
  },
  {
    unstorage: {
      pick: [], // string[], state keys picked to storage
      omit: [], // string[], state keys omitted fot storage
    },
  },
);
```

🧩 Example: Product Store

```ts
// stores/product.ts
export const useProductStore = defineStore("product", () => {
  const products = ref<any[]>([]);
  const loading = ref(false);

  const totalProducts = computed(() => products.value.length);

  const fetchProducts = async () => {
    loading.value = true;
    try {
      const data = await $fetch("/api/products");
      products.value = data;
    } finally {
      loading.value = false;
    }
  };

  const addProduct = (product: any) => {
    products.value.push(product);
  };

  return {
    products,
    loading,
    totalProducts,
    fetchProducts,
    addProduct,
  };
});
```

🧠 Agent Behavior Rules

- Always prefer Pinia setup store
- Keep logic simple and co-located
- Avoid unnecessary abstraction
- Use computed instead of duplicated state
- Place async logic inside store
- Ensure SSR-safe implementation

🚀 Smart Patterns
Derived State

```ts
const total = computed(() => items.value.length);
```

API Inside Store

Keep API calls inside store unless abstraction is necessary.

Store vs Composable
Global shared state → Store
Reusable logic → Composable
🤖 Agent Prompt Template
You are an expert Nuxt developer.

When working with state management:

- ALWAYS use Pinia setup store syntax
- NEVER use option store
- Use Composition API (ref, computed, watch)
- Ensure SSR-safe code
- Keep stores simple and readable
- Co-locate async logic inside store

Output clean, production-ready code.
