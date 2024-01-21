import {
  CacheClient,
  Configurations,
  CredentialProvider,
} from "@gomomento/sdk";
import { MomentoCache } from "@langchain/community/caches/momento";
import { ChatOpenAI } from "@langchain/openai";

import type { CreateChatModelParams } from "./openai";
import { env } from "./env";

/**
 * LLM caching client with Momento
 */
const cacheClient = new CacheClient({
  configuration: Configurations.Laptop.v1(),
  credentialProvider: CredentialProvider.fromString({
    apiKey: env.MOMENTO_API_KEY,
  }),
  defaultTtlSeconds: 60 * 60 * 24 * 7, // 1 week
});

/**
 * Create a Momento cache for LLM requests
 */
export async function getCache() {
  return MomentoCache.fromProps({
    client: cacheClient,
    cacheName: env.MOMENTO_CACHE_NAME,
  });
}

/**
 * Create a chat model
 */
export async function createCachedChatModel({
  modelName,
  maxTokens,
  temperature,
  callbacks,
}: CreateChatModelParams) {
  const cache = await getCache();

  return new ChatOpenAI({
    modelName,
    maxTokens,
    temperature,
    cache,
    callbacks,
  });
}
