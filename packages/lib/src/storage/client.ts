import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@brain2/lib";

export const Buckets = {
  DEFAULT: "brain2-dev",
};

/**
 * StorageClient manages read/write access to a persistent file store
 */
export default class StorageClient {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: env.AWS_S3_REGION,
      credentials: {
        accessKeyId: env.AWS_S3_ACCESS_KEY,
        secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Check if a file exists in the storage bucket
   */
  async fileExists(fileName: string, bucketName: string = Buckets.DEFAULT) {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        }),
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Upload a file to the storage bucket
   */
  async uploadFile(
    fileName: string,
    content: string | Buffer,
    bucketName: string = Buckets.DEFAULT,
  ) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: content,
      }),
    );
  }

  /**
   * Generate a signed URL for a file in the storage bucket
   */
  async generateSignedUrl(
    fileName: string,
    bucketName: string = Buckets.DEFAULT,
    ttlSeconds: number = 15 * 60,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: ttlSeconds,
    });

    return url;
  }
}
