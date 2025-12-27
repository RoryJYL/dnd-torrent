import { Hono } from "hono";
import { createQBittorrentClient, type QBittorrentClient } from "./qbittorrent";

type Bindings = {
  QBITTORRENT_URL: string;
};

type Variables = {
  qb: QBittorrentClient;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: create qBittorrent client once per request
app.use("*", async (c, next) => {
  c.set("qb", createQBittorrentClient(c.env.QBITTORRENT_URL));
  await next();
});

app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();
  const response = await c.get("qb").login(username, password);

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

  const response = await c.get("qb").checkAuth(cookie);
  if (!response.ok) {
    return c.json({ authenticated: false }, 401);
  }

  return c.json({ authenticated: true });
});

app.get("/api/torrents", async (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const response = await c.get("qb").getTorrents(cookie);
  if (!response.ok) {
    return c.json({ error: "Failed to fetch torrents" }, 500);
  }

  return c.json(await response.json());
});

app.get("/api/categories", async (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const response = await c.get("qb").getCategories(cookie);
  if (!response.ok) {
    return c.json({ error: "Failed to fetch categories" }, 500);
  }

  return c.json(await response.json());
});

app.get("/api/preferences", async (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const response = await c.get("qb").getPreferences(cookie);
  if (!response.ok) {
    return c.json({ error: "Failed to fetch preferences" }, 500);
  }

  return c.json(await response.json());
});

app.post("/api/torrents/add", async (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const contentType = c.req.header("Content-Type");
  if (!contentType) {
    return c.json({ error: "Content-Type required" }, 400);
  }

  // Get raw request body without parsing
  const body = await c.req.arrayBuffer();

  const response = await c.get("qb").addTorrent(cookie, body, contentType);

  if (!response.ok) {
    const text = await response.text();
    return c.json({ error: text || "Failed to add torrent" }, 500);
  }

  return c.json({ success: true });
});

export default app;
