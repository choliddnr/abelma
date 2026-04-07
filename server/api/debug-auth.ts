export default defineEventHandler((event) => {
  const auth = _auth(event);
  return {
    baseURL: auth.options.baseURL,
    headers: getHeaders(event),
    url: event.node.req.url,
    fullUrl: getRequestURL(event).toString()
  }
})
