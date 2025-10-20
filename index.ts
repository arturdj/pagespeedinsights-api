import { handleRequest } from "./src/function/index.js";

export default {
  fetch: async (request: Request, env: any, ctx: any) => {
    return handleRequest({ request, args: env });
  }
};
