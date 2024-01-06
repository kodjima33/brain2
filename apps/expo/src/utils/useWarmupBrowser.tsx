import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

/**
 * Warm up the browser for better in-app UX
 * https://docs.expo.dev/guides/authentication/#improving-user-experience
 */
export function useWarmupBrowser() {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};