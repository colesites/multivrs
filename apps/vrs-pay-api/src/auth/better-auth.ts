import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { DashboardAuth } from "../app.types";
import type { Db } from "../db/client";
import type { EmailSender } from "../email/email.types";
import { resetPasswordEmail } from "../email/reset-password-email";
import type { MerchantStore } from "../stores/merchant.store";
import { ensureMerchant } from "./merchant-for-user";

type Env = Record<string, string | undefined>;

const MIN_PASSWORD_LENGTH = 8;
const RESET_LINK_SECONDS = 60 * 60;

function socialProviders(env: Env) {
  return {
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
      : {}),
  };
}

/**
 * Dashboard sign-in with Better Auth (email + password, plus GitHub and
 * Google when their credentials are set), stored in VRS Pay's database.
 * Every new user gets a merchant; password resets go out by `email`.
 * Null when the env isn't configured.
 */
export function createBetterAuth(
  db: Db,
  env: Env,
  merchants: MerchantStore,
  email: EmailSender | null,
): DashboardAuth | null {
  const { BETTER_AUTH_SECRET: secret, BETTER_AUTH_URL: baseURL, VRS_DASHBOARD_URL: origin } = env;
  if (!secret || !baseURL || !origin) return null;
  const social = socialProviders(env);
  const auth = betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    basePath: "/auth",
    baseURL,
    secret,
    trustedOrigins: [origin],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      autoSignIn: true,
      resetPasswordTokenExpiresIn: RESET_LINK_SECONDS,
      revokeSessionsOnPasswordReset: true,
      ...(email
        ? {
            sendResetPassword: async ({
              user,
              url,
            }: {
              user: { email: string; name: string };
              url: string;
            }) => {
              await email.send(resetPasswordEmail(user.email, user.name, url));
            },
          }
        : {}),
    },
    socialProviders: social,
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensureMerchant(merchants, user);
          },
        },
      },
    },
  });
  return {
    origin,
    socialProviders: Object.keys(social),
    handler: (request) => auth.handler(request),
    async session(headers) {
      const session = await auth.api.getSession({ headers });
      if (!session) return null;
      const { id, email, name, image } = session.user;
      return { id, email, name, image: image ?? null };
    },
  };
}
