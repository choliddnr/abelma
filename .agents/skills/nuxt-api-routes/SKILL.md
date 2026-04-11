---
name: nuxt-api-routes
description: Use this skill when creating or modifying Nuxt server API endpoints, handling HTTP methods, params, query, and body.
---

# Nuxt API Routes

Use this skill to implement and manage server API routes in `server/api/` or `server/routes/`. This includes handling different HTTP methods and extracting data from the request (body, query, params).

## When to use this skill

- Creating new API endpoints in `server/api/`.
- Implementing dynamic routes (e.g., `server/api/user/[id].ts`).
- Parsing and validating request bodies or query parameters.
- Restricting endpoints to specific HTTP methods (GET, POST, etc.).

## When NOT to use this skill

- Implementing logic that should run on EVERY request (use `nuxt-middleware` instead).
- Creating reusable utility functions (use `nuxt-server-utils` instead).
- Accessing Nitro storage or complex background tasks (use `nuxt-advanced-server` instead).

## Core Patterns

### Basic API Route

Define handlers using `defineEventHandler`.

```typescript
export default defineEventHandler((event) => {
  return {
    message: "Hello World",
  };
});
```

### Method Handling

Suffix the file name with the method (e.g., `user.post.ts`)

### Parsing Request Data

Use H3 utilities for type-safe data extraction.

```typescript
export default defineEventHandler(async (event) => {
  // Extract query: /api/search?q=nuxt
  const query = getQuery(event);

  // Extract body (for POST/PUT/PATCH)
  const body = await readBody(event);

  // Extract route params: /api/user/[id].patch.ts
  const id = getRouterParam(event, "id");

  return { query, body, id };
});
```

### Validation with Zod

Use `readValidatedBody` or `getValidatedQuery` for schema enforcement.

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => schema.safeParse(b));
  return { success: true, body };
});
```

## Best Practices

- Always use `defineEventHandler` for auto-imports and better type inference.
- Prefer file suffixes (`.post.ts`) over manual method checks when possible.
- Use `createError` for structured error responses.
- Access headers via `getHeader(event, 'name')`.
