import { Hono } from "hono";
import { checkAuth, login } from "./qbittorrent";

const app = new Hono();

app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();
  const response = await login(username, password);

  // get the cookies from the response
  const cookies = response.headers.get("Set-Cookie");
  if (!cookies) {
    return c.json({ error: "Login failed" }, 401);
  }

  // set the cookies in the response
  c.res.headers.set("Set-Cookie", cookies);

  return c.json({ message: "Login successful" });
});

app.get("/api/auth/check", async (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ authenticated: false }, 401);
  }

  const response = await checkAuth(cookie);
  if (!response.ok) {
    return c.json({ authenticated: false }, 401);
  }

  return c.json({ authenticated: true });
});

export default app;
