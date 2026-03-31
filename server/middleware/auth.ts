export default defineEventHandler(async (e) => {
  const url = getRequestURL(e);
  if (url.pathname.startsWith("/api/alphabet")) {
    const session = await _auth(e).api.getSession({
      headers: e.headers,
    });
    if (!session) {
      return sendError(
        e,
        createError({ statusCode: 401, statusMessage: "Unauthorized" }),
      );
    }
  }
});
