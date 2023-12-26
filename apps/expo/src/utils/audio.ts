import type { Recording } from "expo-av/build/Audio";
import { Audio } from "expo-av";

/**
 * Starts recording and returns the recording object
 */
export async function startRecording(): Promise<Recording> {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );

  return recording;
}

/**
 * Stops the recording and returns the path to the recording file
 */
export async function stopRecording(
  recording: Recording,
): Promise<string | null> {
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });
  return recording.getURI();
}
