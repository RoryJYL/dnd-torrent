import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api", (c) => {
  return c.json({
    name: "Cloudflare",
  });
});

export default app;
