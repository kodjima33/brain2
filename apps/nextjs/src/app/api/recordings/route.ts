import { auth } from "@clerk/nextjs";
import { DateTime } from "luxon";
import StorageClient from "node_modules/@brain2/lib/src/storage/client";
import { OpenAI, toFile } from "openai";
import { z } from "zod";

import type { AudioBlob } from "@brain2/db";
import { generateTranscriptTitle } from "@brain2/ai";
import { AUDIO_FORMAT, generateId, prisma } from "@brain2/db";
import { sendEvent } from "@brain2/lib";

const storageClient = new StorageClient();
const openai = new OpenAI();

/**
 * Get all recordings
 */
export async function GET(_req: Request): Promise<Response> {
  const blobs = await prisma.audioBlob.findMany();
  return Response.json(blobs);
}

/**
 * Transcribe the audio and update the audio blob
 */
async function transcribeAudio(data: Blob, audioBlob: AudioBlob) {
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(data, "memo.m4a"),
    model: "whisper-1",
  });

  const title = await generateTranscriptTitle(transcription.text);

  // Update audio blob with transcription
  // Create a single note with the transcription, keep inactive until refinement
  await prisma.audioBlob.update({
    where: {
      id: audioBlob.id,
    },
    data: {
      transcription: transcription.text,
      title,
      note: {
        update: {
          title,
          content: transcription.text,
        },
      },
    },
  });

  // Refine the transcript async
  await sendEvent({
    name: "recording.created",
    data: {
      noteId: audioBlob.noteId,
    },
  });
}

const base64Schema = z.object({
  audio: z.string(),
});

/**
 * Get the audio buffer from the request, either from a base64 string or a file
 */
async function getAudioBuffer(req: Request): Promise<Buffer> {
  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    // Parse formdata
    const formData = await req.formData();

    const file = formData.get("file") as Blob | null;
    if (file == null) {
      throw new Error("File blob is required");
    }

    // TODO: Figure out file conversions
    // Need to ensure that input audio is in a supported format (e.g. mp4, wav)
    // Look into fluent-ffmpeg, but need to reconcile issue with unsupported readable streams
    // See https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/1139
    const audioBuffer = Buffer.from(await file.arrayBuffer());
    return audioBuffer;
  }
  // Decode base64 audio
  const { audio } = base64Schema.parse(await req.json());
  const audioBuffer = Buffer.from(audio, "base64");
  return audioBuffer;
}

/**
 * Create an audio recording
 */
export async function POST(req: Request): Promise<Response> {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const audioBuffer = await getAudioBuffer(req);

  const id = generateId("audioBlob");
  const path = `audio/${id}.${AUDIO_FORMAT}`;
  const formattedDate = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  const title = `Recording ${formattedDate}`;

  const [audioBlob, _] = await Promise.all([
    prisma.audioBlob.create({
      data: {
        id,
        title,
        owner: userId,
        note: {
          create: {
            id: generateId("note"),
            title,
            content: "",
            owner: userId,
            digestSpan: "SINGLE",
            active: true,
          },
        },
      },
    }),
    storageClient.uploadFile(path, audioBuffer),
  ]);

  // Use updated m4a audio blob
  const convertedBlob = new Blob([audioBuffer]);
  await transcribeAudio(convertedBlob, audioBlob);

  return Response.json(audioBlob);
}
