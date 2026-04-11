---
name: nuxt-runtime-config
description: Use this skill when accessing environment variables or runtime configuration inside server handlers.
---

# Nuxt Runtime Config

Use this skill to access and manage server-side configuration and environment variables in Nuxt. Runtime config is defined in `nuxt.config.ts` and can be overridden by environment variables.

## When to use this skill

- Accessing API keys, secrets, or database URLs in server handlers.
- Configuring server-side behavior based on environment variables.
- Using `useRuntimeConfig(event)` to get current config within an event handler.
- Mapping environment variables with the `NUXT_` prefix to config keys.

## When NOT to use this skill

- Accessing config on the client-side (unless specifically marked for the client).
- Implementing global request interceptors (use `nuxt-middleware` instead).
- Storing transient data (use `nuxt-advanced-server` with Nitro storage instead).

## Core Patterns

### Defining Config in `nuxt.config.ts`

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Secret keys that are only available on the server
    apiSecret: "", // can be overridden by NUXT_API_SECRET env var

    // Public keys that are exposed to the client
    public: {
      apiBase: "/api", // can be overridden by NUXT_PUBLIC_API_BASE env var
    },
  },
});
```

### Accessing Config in API Route

```typescript
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  // Accessing server-only secret
  const secret = config.apiSecret;

  return {
    apiBase: config.public.apiBase,
  };
});
```

### Environment Variable Overrides

Nuxt maps environment variables to config keys using camelCase conversion.

| Env Variable           | Config Key              |
| :--------------------- | :---------------------- |
| `NUXT_API_SECRET`      | `config.apiSecret`      |
| `NUXT_PUBLIC_API_BASE` | `config.public.apiBase` |

## Best Practices

- Never commit real secrets to `nuxt.config.ts`. Use empty strings as placeholders.
- Always prefix environment variables with `NUXT_` for automatic mapping.
- For typesafety, ensure everything is defined in `nuxt.config.ts` so Nuxt can generate the proper TypeScript interfaces.
- Use `useRuntimeConfig(event)` instead of just `useRuntimeConfig()` in server handlers to ensure context-aware config access.
