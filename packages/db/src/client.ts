import type { AudioBlob } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export * from "@prisma/client";

export const AUDIO_FORMAT = "m4a";

export const prisma = new PrismaClient({
  log: ["error"],
})
  .$extends(withAccelerate())
  .$extends({
    // Add computed field for the S3 path
    // TODO: update file extension as needed
    result: {
      audioBlob: {
        s3Path: {
          needs: { id: true },
          compute(audioBlob: AudioBlob) {
            return `audio/${audioBlob.id}.${AUDIO_FORMAT}`;
          },
        },
      },
    },
  });
