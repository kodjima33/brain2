import { Buffer } from "buffer";
import type { AxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import axios from "axios";

import type { Note } from "@brain2/db/client";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
function getBaseUrl() {
  // Get IP address of host-machine
  // In production, this will need to be replaced with the production API URL
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    // Vercel host
    return "https://brain2-psi.vercel.app";
  }
  return `http://${localhost}:3000`;
}

/**
 * Wrapper around fetch() to send requests to the API
 */
async function sendRequest<T>(
  path: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data } = await axios<T>({
      ...options,
      url: `${getBaseUrl()}${path}`,
    });
    return data;
  } catch (err) {
    console.error("[sendReq] Failed to send request", err);
    throw err;
  }
}

/**
 * Send a GET request
 */
async function get<T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> {
  return sendRequest(path, {
    headers,
  });
}

/**
 * Send a json-encoded POST request
 */
async function post<T>(
  path: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<T> {
  return sendRequest(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    data: JSON.stringify(body),
  });
}

/**
 * Send a json-encoded DELETE request
 */
async function del<T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> {
  return sendRequest(path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Send a form-encoded POST request
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function postForm<T>(path: string, formData: FormData): Promise<T> {
  return sendRequest(path, {
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function getNoteById(id: string): Promise<Note> {
  return get(`/api/notes/${id}`);
}

export async function deleteNoteById(id: string): Promise<Note> {
  return del(`/api/notes/${id}`);
}

export async function getNotes(authToken: string): Promise<Note[]> {
  return get("/api/notes", {
    Authorization: `Bearer ${authToken}`,
  });
}

export async function createNote(content: string): Promise<void> {
  return post("/api/notes", { content });
}

export async function uploadRecording(audioUrl: string): Promise<void> {
  const content = await fetch(audioUrl);
  const audioBuffer = Buffer.from(await content.arrayBuffer());
  const b64 = audioBuffer.toString("base64");
  return post("/api/recordings", { audio: b64 });
}
