import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    baseURL: {
        allowedHosts: ["multivrs.vercel.app", "*.vercel.app", "localhost:3000"],
    },
    plugins: [
        dash()
    ]
})