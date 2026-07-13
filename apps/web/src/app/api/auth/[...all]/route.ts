import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Use Node.js runtime for Better Auth
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
