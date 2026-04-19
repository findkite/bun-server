// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? process.env.DATABASE_URL!
        : "postgresql://postgres:Farahmand#33@db.hrgotyqxtvzgessfrmos.supabase.co:5432/postgres",
  },
});
