import { ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

import "../styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AuthenticatedLayout() {
  return <Slot initialRouteName="auth" />;
}

// This is the main layout of the app
// It wraps your pages with the providers they need
function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={
        Constants.expoConfig?.extra?.clerkPublishableKey as string
      }
    >
      <QueryClientProvider client={queryClient}>
        <AuthenticatedLayout />
        <StatusBar />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default RootLayout;