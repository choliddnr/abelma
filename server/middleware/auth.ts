export default defineEventHandler(async (e) => {
  const url = getRequestURL(e);
  const protectedPrefixes = ["/api/alphabet", "/api/profile", "/api/reward", "/api/sync"];
  
  if (protectedPrefixes.some(p => url.pathname.startsWith(p))) {
    const session = await _auth(e).api.getSession({
      headers: e.headers,
    });
    
    if (!session) {
      return sendError(
        e,
        createError({ statusCode: 401, statusMessage: "Unauthorized" }),
      );
    }

    // Expose session to handlers
    e.context.session = session;
  }
});
