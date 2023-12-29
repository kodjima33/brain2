import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

const chatModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.1,
});

const prompt =
  "You will be provided with audio recording transcripts. Provide a concise 3-5 word title for the recording. Make sure to emphasize any important terms or highlights from the transcript.";

/**
 * Create a title for a transcript
 */
export async function generateTranscriptTitle(
  transcription: string,
): Promise<string> {
  const response = await chatModel.call([
    new SystemMessage(prompt),
    new HumanMessage(transcription),
  ]);

  const title = response.content.toString().trim();
  if (title.startsWith('"') && title.endsWith('"')) {
    return title.slice(1, -1);
  }
  return title;
}
