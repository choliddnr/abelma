import { useLogger } from "@nuxt/kit";

// Note: In a runtime server environment, we often use consola directly,
// but if you are developing a module, you define the logger like this:
const logger = useLogger("my-api-app");

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    // This hook triggers when a response is sent from the server
    const status = response.statusCode;
    const method = event.method;
    const url = event.path;

    if (status! >= 400) {
      logger.error(`[${method}] ${url} - Error: ${status}`);
    } else {
      logger.success(`[${method}] ${url} - Success: ${status}`);
    }
  });
});
