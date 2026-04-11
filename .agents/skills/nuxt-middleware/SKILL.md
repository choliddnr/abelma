---
name: nuxt-middleware
description: Use this skill when implementing request middleware such as authentication, logging, or request validation.
---

# Nuxt Server Middleware

Use this skill to create and manage server-side middleware in `server/middleware/`. These handlers run on every request before the actual route handlers.

## When to use this skill

- Implementing global request logging.
- Checking authentication headers or session cookies.
- Extending the `event.context` with user information or database instances.
- Global request validation or transformation.

## When NOT to use this skill

- Implementing logic for a specific endpoint (use `nuxt-api-routes` instead).
- Creating non-global server plugins (use `nuxt-advanced-server` for plugins).
- Client-side middleware (this skill is for `server/` directory only).

## Core Patterns

### Basic Middleware

Middleware files are automatically registered from `server/middleware/`.

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  const authHeader = getHeader(event, "Authorization");

  if (authHeader) {
    // Add data to context for use in route handlers
    event.context.auth = { authenticated: true };
  }
});
```

### Request Logging

```typescript
// server/middleware/logger.ts
export default defineEventHandler((event) => {
  console.log(`[${new Date().toISOString()}] ${event.method} ${event.path}`);
});
```

### Context Enrichment

Common pattern to make data available to all handlers.

```typescript
export default defineEventHandler((event) => {
  event.context.startTime = Date.now();
});
```

## Best Practices

- Middleware should be fast and non-blocking, as it affects every request.
- Use `event.context` to pass data down to route handlers.
- Be careful with matching: middleware runs for all server routes, including assets if not filtered.
- Do not return values unless you intend to end the request (though normally server middleware shouldn't return values).
