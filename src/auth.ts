import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { emailOTP, openAPI, twoFactor } from "better-auth/plugins";

import * as schema from "../src/db/schema"; // IMPORT YOUR SCHEMA TABLES
import { db } from "./db";
const isProduction = process.env.NODE_ENV === "production";
const cookieConfig = {
  sessionToken: {
    name: "findkite_session",
    attributes: {
      httpOnly: true,
      // Only require HTTPS in production
      secure: isProduction,
      // 'none' requires 'secure: true', so use 'lax' for local dev
      sameSite: isProduction ? "none" : "lax",
      // Don't set a domain for localhost, let the browser handle it
      domain: isProduction
        ? process.env.BETTER_AUTH_TRUSTED_ORIGINS
        : undefined,
      path: "/",
    },
  },
};
export const auth = betterAuth({
  trustedOrigins: [process.env.BETTER_AUTH_TRUSTED_ORIGINS!],

  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema: schema,
  }),

  // ✅ MOVE IT HERE (top-level)
  emailVerification: {
    enabled: true,
    sendVerificationEmail: async (data) => {
      console.log(`
        ==============================
        📧 VERIFY EMAIL (DEV)
        To: ${data.user.email}
        Name: ${data.user.name}
        👉 URL: ${data.url}
        🔑 Token: ${data.token}
        all:${JSON.stringify(data, null, 6)}
        ==============================
      `);
    },
  },
  emailAndPassword: {
    requireEmailVerification: true,

    enabled: true,
    sendResetPassword: async (data) => {
      console.log(`
          ==============================
          🔑 RESET PASSWORD (DEV)
          To: ${data.user.email}
          👉 ${data.url}
          Token: ${data.token}
          all ${JSON.stringify(data, null, 3)}
          ==============================
      `);
    },
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  plugins: [
    openAPI(),
    twoFactor({
      allowPasswordless: true,
      otpOptions: {
        async sendOTP({ user, otp }) {
          sendEmail({
            to: user.email,
            subject: "Your two-factor authentication code",
            text: `Your OTP code is: ${otp}`,
          });
        },
      },
    }),
    passkey(),
    emailOTP({
      overrideDefaultEmailVerification: true, // Use OTP instead of link
      async sendVerificationOTP(data) {
        console.log(data);
      },
    }),
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  cookies: {
    sessionToken: cookieConfig.sessionToken,
  },
  baseURL: process.env.BETTER_AUTH_URL!,
});
function sendEmail(arg0: { to: string; subject: string; text: string }) {
  console.log(` to: ${arg0.to}, subject: ${arg0.subject} text: ${arg0.text}`);
}
