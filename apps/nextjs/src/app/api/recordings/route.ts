import { DateTime } from "luxon";
import StorageClient from "node_modules/@brain2/lib/src/storage/client";

import { generateId, prisma } from "@brain2/db";

const storageClient = new StorageClient();

/**
 * Get all recordings
 */
export async function GET(_req: Request): Promise<Response> {
  const blobs = await prisma.audioBlob.findMany();
  return Response.json(blobs);
}

/**
 * Create an audio recording
 */
export async function POST(req: Request): Promise<Response> {
  const formData = await req.formData();

  const file = formData.get("file") as Blob | null;
  if (file == null) {
    return Response.json({ error: "File blob is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = generateId("audioBlob");
  const path = `audio/${id}.m4a`;
  const formattedDate = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  const title = `Recording ${formattedDate}`;

  const [audioBlob, _] = await Promise.all([
    prisma.audioBlob.create({
      data: {
        id,
        title,
        owner: "",
      },
    }),
    storageClient.uploadFile(path, buffer),
  ]);

  return Response.json(audioBlob);
}
