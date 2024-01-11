import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    AWS_S3_REGION: z.string(),
    AWS_S3_ACCESS_KEY: z.string(),
    AWS_S3_SECRET_ACCESS_KEY: z.string(),
    INGGEST_EVENT_KEY: z.string(),
    INGGEST_SIGNING_KEY: z.string(),
  },
  client: {},
  runtimeEnv: process.env,
});
