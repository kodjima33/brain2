import Constants from "expo-constants";

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
    // return "https://turbo.t3.gg";
    throw new Error(
      "Failed to get localhost. Please point to your production server.",
    );
  }
  return `http://${localhost}:3000`;
}

/**
 * Wrapper around fetch() to send requests to the API
 */
async function sendRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}/${path}`, options);
  const json = (await response.json()) as T;
  return json;
}

/**
 * Send a GET request
 */
async function get<T>(path: string): Promise<T> {
  return sendRequest(path);
}

/**
 * Send a json-encoded POST request
 */
async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return sendRequest(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function getNotes(): Promise<Note[]> {
  return get("/api/notes");
}

export async function createNote(content: string): Promise<void> {
  return post("/api/notes", { content });
}
