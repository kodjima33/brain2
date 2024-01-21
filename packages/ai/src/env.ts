import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    OPENAI_API_KEY: z.string(),
    // Langsmith
    LANGCHAIN_TRACING_V2: z.string(),
    LANGCHAIN_ENDPOINT: z.string().url(),
    LANGCHAIN_API_KEY: z.string(),
    LANGCHAIN_PROJECT: z.string(),
    // Momento LLM response caching
    MOMENTO_API_KEY: z.string(),
    MOMENTO_CACHE_NAME: z.string(),
  },
  client: {},
  runtimeEnv: process.env,
});
