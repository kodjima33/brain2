import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string().url(),
    MESSENGER_VERIFY_TOKEN: z.string(),
    MESSENGER_ACCESS_TOKEN: z.string(),
    MESSENGER_API_URL: z.string(),
  },
  client: {},
  runtimeEnv: process.env,
});
