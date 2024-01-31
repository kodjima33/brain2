import React from "react";
import { PaperProvider } from "react-native-paper";
import Constants from "expo-constants";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";

import "../styles.css";

import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const tokenCache = {
  async getToken(key: string) {
    const attempts = 3;
    for (let i = 0; i < attempts; i++) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        console.error("Failed to get token", err);
      }
    }
    console.log(
      `Failed to get token after ${attempts} attempts. Deleting token.`,
    );
    await SecureStore.deleteItemAsync(key);
    return null;
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const queryClient = new QueryClient();

// This is the main layout of the app
// It wraps your pages with the providers they need
function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={
        Constants.expoConfig?.extra?.clerkPublishableKey as string
      }
    >
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <Slot />
        </PaperProvider>
        <StatusBar />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
