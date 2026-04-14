import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    // ... your existing config
    plugins: [
        // ... other plugins
        dash()
    ]
})