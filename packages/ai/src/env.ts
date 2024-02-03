import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    OPENAI_API_KEY: z.string(),
    VERCEL_PROD_URL: z.string(),
    // Langsmith
    LANGCHAIN_TRACING_V2: z.string(),
    LANGCHAIN_ENDPOINT: z.string().url(),
    LANGCHAIN_API_KEY: z.string(),
    LANGCHAIN_PROJECT: z.string(),
    // Momento LLM response caching
    MOMENTO_API_KEY: z.string(),
    MOMENTO_CACHE_NAME: z.string(),
    // Pinecone vector store
    PINECONE_API_KEY: z.string(),
    PINECONE_INDEX: z.string(),
  },
  client: {},
  runtimeEnv: {
    ...process.env,
    VERCEL_PROD_URL:
      process.env.VERCEL_ENV === "production"
        ? "https://brain2-psi.vercel.app"
        : process.env.VERCEL_ENV === "development"
        ? `http://${process.env.VERCEL_URL}`
        : `https://${process.env.VERCEL_URL}`,
  },
});
