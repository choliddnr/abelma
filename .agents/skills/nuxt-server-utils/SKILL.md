---
name: nuxt-server-utils
description: Use this skill when creating reusable server-side utilities, wrappers, or shared logic.
---

# Nuxt Server Utilities

Use this skill to create shared logic and reusable helper functions in `server/utils/`. Nitro automatically auto-imports files in this directory, making them available in all API handlers and middleware.

## When to use this skill

- Creating shared business logic used across multiple API routes.
- Implementing custom event handler wrappers (e.g., for error handling or response formatting).
- Building database utility functions for server-side use.
- Abstracting complex H3 logic into descriptive helpers.

## When NOT to use this skill

- Implementing logic that only exists in a single API route (keep it local).
- Logic that needs to be shared with the client-side (use `shared/` or `app/utils/` instead).
- Server lifecycle plugins (use `nuxt-advanced-server` instead).

## Core Patterns

### Shared Helper Functions

Files in `server/utils/` are auto-imported.

```typescript
// server/utils/formatting.ts
export const formatUserResponse = (user: any) => {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
  };
};
```

### Custom Handler Wrappers

You can wrap `defineEventHandler` to add consistent behavior.

```typescript
// server/utils/handler.ts
import type { EventHandler, EventHandlerRequest } from "h3";

export const defineWrappedHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D> => {
  return defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      return { success: true, data: response };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
};
```

## Best Practices

- Keep utilities pure and focused on a single responsibility.
- Leverage the `#server` alias for clear imports if auto-import fails or for deep nesting: `import { helper } from '#server/utils/helper'`.
- Ensure helpers are well-typed for better DX in the API routes.
- Avoid utility "bloat": only move logic here if it's truly shared.
