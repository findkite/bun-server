import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { error } from "better-auth/api";
import { cors } from "hono/cors";
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();
app.use(
  "/api/auth/*",
  cors({
    origin: ["http://localhost:3001", "https://findkite.com"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
app.use(logger());
// ✅ session middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
  } else {
    c.set("user", session.user);
    c.set("session", session.session);
  }

  await next();
});
// auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
app.get("/", (c) => {
  return c.text("Hello Hono! Auth endpoints ready");
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const user = c.get("user");
    return {
      onOpen: async (event, ws) => {
        try {
          if (!user) {
            console.error("WebSocket auth failed:", error);
            ws.send(
              JSON.stringify({
                type: "error",
                code: "UNAUTHORIZED",
                message: "Unauthorized access - invalid or missing token",
              }),
            );
            ws.close(1008, "Unauthorized");
            return;
          }

          console.log(`WebSocket connected for user:  (${user.name})`);
          ws.send(
            JSON.stringify({
              type: "connected",
              message: `Welcome ${user.email}!`,
              userId: user.id,
              timestamp: new Date().toISOString(),
            }),
          );
        } catch (error) {
          console.error("Connection error:", error);
          ws.close(1011, "Internal error");
        }
      },

      onMessage(event, ws) {},

      onClose: () => {
        if (user) {
          console.log(`WebSocket closed for: ${user.name}`);
        }
      },

      onError: (event, ws) => {
        console.error("WebSocket error:", event);
        ws.send(
          JSON.stringify({
            type: "error",
            code: "WEBSOCKET_ERROR",
            message: "Server error occurred",
          }),
        );
      },
    };
  }),
);
export default {
  port: process.env.PORT || 4000,
  fetch: app.fetch,
  websocket,
};
