import { onRequestGet as __api_state_ts_onRequestGet } from "D:\\Project\\abelma\\functions\\api\\state.ts"
import { onRequestPost as __api_state_ts_onRequestPost } from "D:\\Project\\abelma\\functions\\api\\state.ts"

export const routes = [
    {
      routePath: "/api/state",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_state_ts_onRequestGet],
    },
  {
      routePath: "/api/state",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_state_ts_onRequestPost],
    },
  ]