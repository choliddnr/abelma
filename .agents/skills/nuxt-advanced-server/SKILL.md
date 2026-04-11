---
name: nuxt-advanced-server
description: Use this skill for advanced Nitro features such as storage, streaming, background tasks, and plugins.
---

# Nuxt Advanced Server Features

Use this skill to implement advanced Nitro-specific features in your Nuxt server, such as persistent storage, streaming data, background execution, and lifecycle plugins.

## When to use this skill

- Implementing Nitro plugins in `server/plugins/` to hook into server lifecycle events.
- Using `useStorage()` for key-value (KV) data persistence.
- Handling streaming responses (e.g., for Large Language Models or heavy data downloads).
- Running background tasks after a response has been sent using `event.waitUntil()`.

## When NOT to use this skill

- Standard API route creation (use `nuxt-api-routes` instead).
- Implementing global request interceptors (use `nuxt-middleware` instead).
- Accessing env vars (use `nuxt-runtime-config` instead).

## Core Patterns

### Nitro Plugins

Registered in `server/plugins/`, these run once when the server starts.

```typescript
// server/plugins/nitro.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html, { event }) => {
    // Modify HTML before it's sent to the client
  });
});
```

### Nitro Storage (KV)

Access the built-in storage layer.

```typescript
export default defineEventHandler(async (event) => {
  const storage = useStorage("cache");

  // Save data
  await storage.setItem("my-key", { foo: "bar" });

  // Retrieve data
  const data = await storage.getItem("my-key");

  return data;
});
```

### Background Tasks

Run long-running tasks without blocking the client response.

```typescript
export default defineEventHandler((event) => {
  // Task that doesn't block the response
  const slowTask = async () => {
    await new Promise((r) => setTimeout(r, 5000));
    console.log("Background task finished");
  };

  event.waitUntil(slowTask());

  return { status: "Accepted" };
});
```

### Streaming Responses

Use `sendStream` or return a stream directly.

```typescript
export default defineEventHandler((event) => {
  const stream = createMyReadStream();
  return sendStream(event, stream);
});
```

## Best Practices

- Be mindful of resource usage in `event.waitUntil()` as it continues to consume server memory/CPU after the request ends.
- Use `useStorage()` instead of local files for persistence to ensure compatibility with serverless environments.
- Use Nitro hooks sparingly in plugins to avoid impacting server startup time.
- For Large Language Model (LLM) responses, prefer `sendIterable` or `sendStream` for a "typing" effect.
