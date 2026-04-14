import { sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    // ... your existing config
    plugins: [
        // ... other plugins
        sentinelClient()
    ]
})