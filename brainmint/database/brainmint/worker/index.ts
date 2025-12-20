// ================= ROUTER (ENTRY POINT) =================
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

// ================= CONFIG =================
const USD_TO_KES = 160;

// ================= HELPERS =================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

// ================= PASSWORD HASH =================
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ================= REGISTER =================
async function register(req, env) {
  const { username, email, password } = await req.json();

  if (!username || !password) {
    return error("Missing fields");
  }

  const passwordHash = await hashPassword(password);

  try {
    await env.DB.prepare(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
    ).bind(username, email, passwordHash).run();
  } catch {
    return error("User already exists");
  }

  return json({ success: true });
}

// ================= LOGIN =================
async function login(req, env) {
  const { username, password } = await req.json();
  const passwordHash = await hashPassword(password);

  const user = await env.DB.prepare(
    "SELECT id, status FROM users WHERE username=? AND password_hash=?"
  ).bind(username, passwordHash).first();

  if (!user) return error("Invalid credentials", 401);
  if (user.status !== "active") return error("Account not active", 403);

  return json({ userId: user.id });
}

// ================= GET TASKS =================
async function getTasks(env) {
  const tasks = await env.DB.prepare(
    "SELECT id, title, reward_tokens, daily_limit FROM tasks WHERE active=1"
  ).all();

  return json(tasks.results);
}

// ================= COMPLETE TASK =================
async function completeTask(req, env) {
  const { userId, taskId } = await req.json();

  const task = await env.DB.prepare(
    "SELECT reward_tokens FROM tasks WHERE id=? AND active=1"
  ).bind(taskId).first();

  if (!task) return error("Invalid task");

  const user = await env.DB.prepare(
    "SELECT tokens FROM users WHERE id=?"
  ).bind(userId).first();

  let newTokens = user.tokens + task.reward_tokens;

  // 750 RESET
  if (newTokens >= 750) {
    await env.DB.prepare(
      "UPDATE users SET tokens=0, starter_card=1 WHERE id=?"
    ).bind(userId).run();

    await log(env, "TOKEN_RESET", userId);
    return json({ message: "Starter card granted" });
  }

  // 550 PAYOUT
  if (newTokens >= 550) {
    await env.DB.prepare(
      "INSERT INTO transactions (user_id, type, tokens, amount_kes) VALUES (?, 'withdraw', 550, 250)"
    ).bind(userId).run();

    newTokens -= 550;
  }

  await env.DB.prepare(
    "UPDATE users SET tokens=? WHERE id=?"
  ).bind(newTokens, userId).run();

  return json({ success: true, tokens: newTokens });
}

// ================= ADMIN LOG =================
async function log(env, action, userId) {
  await env.DB.prepare(
    "INSERT INTO admin_logs (action, data) VALUES (?, ?)"
  ).bind(action, JSON.stringify({ userId })).run();
}
