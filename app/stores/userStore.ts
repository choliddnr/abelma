import type { User, Session } from "better-auth";
import { authClient } from "~/utils/auth-client";

export const useUserStore = defineStore("user", () => {
  const session = ref<Session>();
  const user = ref<User>();
  const isLoaded = ref(true);

  const fetchSession = async (force = false) => {
    // Only fetch if session is missing OR if we explicitly force it (e.g. after login)
    if (session.value && !force) {
      return session.value;
    }

    const data = await authClient.getSession({
      fetchOptions: {
        headers: useRequestHeaders(["cookie"]),
      },
    });

    session.value = data.data?.session;
    user.value = data.data?.user;
    return session.value;
  };

  const getSession = async () => {
    return await fetchSession(true);
  };

  const reset = () => {
    session.value = undefined;
    user.value = undefined;
    isLoaded.value = true;
  };

  return {
    session,
    user,
    isLoaded,
    getSession,
    fetchSession,
    reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
