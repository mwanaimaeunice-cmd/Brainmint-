export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/register") {
      return register(req, env);
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      return login(req, env);
    }

    if (req.method === "GET" && url.pathname === "/api/tasks") {
      return getTasks(env);
    }

    if (req.method === "POST" && url.pathname === "/api/complete-task") {
      return completeTask(req, env);
    }

    return new Response("BrainMint API running");
  }
};
