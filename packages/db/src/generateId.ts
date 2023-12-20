import { init } from "@paralleldrive/cuid2";
import { prisma } from ".";

const createCuid = init({
  random: Math.random,
  length: 15,
});

/**
 * Mapping of Prisma models to their prefixes
 */
const prefixes: Record<PrismaModelName, string> = {
  "user": "usr",
};

/**
 * Generate a prefixed ID from a model
 * e.g. generatePrefixedId("user") => "usr_abcd1234"
 */
export function generateId(modelName: PrismaModelName): string {
  const prefix = prefixes[modelName];
  return `${prefix}_${createCuid()}`;
}

/**
 * A type representing the name of a model in our prisma schema
 */
export type PrismaModelName = Exclude<{
  [Key in keyof typeof prisma]: Key extends `$${string}` ? never : Key
}[keyof typeof prisma], symbol>;
