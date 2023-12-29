import type { AudioBlob } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

export const AUDIO_FORMAT = "mp3";

export const prisma = new PrismaClient({
  log: ["error"],
}).$extends({
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
