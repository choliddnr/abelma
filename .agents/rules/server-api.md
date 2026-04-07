---
trigger: glob
globs: server/api/*
---

# Add comments explaining:

- Why the code exists (not just what it does)
- Any tricky logic
- TODO items

# use JSDoc for functions/method:

````typescript
/**
 * Calculate user's current level based on their total points.
 * @param totalPoints - The total points of the user.
 * @returns The current level of the user.
 */
function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) {
    return 1;
  } else if (totalPoints < 200) {
    return 2;
  } else if (totalPoints < 300) {
    return 3;
  } else {
    return 4;
  }
}

# use `zod` and `getValidatedBody()` to validate req body. url: https://v1.h3.dev/utils/request#body-utils
# save the type at `shared/types/api.d.ts`. it's accessible for all `server/` and `app/` context. always create type for request and response body
# create sparate files for each req method (GET, POST, PUT, PATCH, DELETE). add the method as suffix of the file name. exp: `server/api/poduct/index.post.ts`
# Skip user validation code. it's handled by `server/middleware/auth.ts`
# use `crypto.randomUUID()` to geneate string UUID.
# error handling
```typescript
try {
 // code here
} catch(e){
 return sendError(
      event,
      createError({
        statusCode: 500, //error code
        statusMessage: "Failed to create profile", //error message
      }),
    );
}
````
