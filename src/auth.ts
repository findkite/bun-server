import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { emailOTP, openAPI, twoFactor } from "better-auth/plugins";

import * as schema from "../src/db/schema"; // IMPORT YOUR SCHEMA TABLES
import { db } from "./db";
export const auth = betterAuth({
  trustedOrigin:
    process.env.BETTER_AUTH_TRUSTED_ORIGINS || "http://localhost:3000",

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
});
