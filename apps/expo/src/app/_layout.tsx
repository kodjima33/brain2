import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import "../styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// This is the main layout of the app
// It wraps your pages with the providers they need
const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/*
        The Stack component displays the current page.
        It also allows you to configure your screens 
      */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar />
    </QueryClientProvider>
  );
};

export default RootLayout;
