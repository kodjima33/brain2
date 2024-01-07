import React from "react";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";

import "../styles.css";

import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
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
        <Stack
          screenOptions={{
            headerShadowVisible: false,
          }}
        />
        <StatusBar />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
