import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "Brain²",
  slug: "brain2",
  scheme: "brain2",
  version: "0.1.1",
  orientation: "portrait",
  icon: "./assets/app-icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#E4DFDA",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.brain2.app",
    supportsTablet: true,
  },
  android: {
    package: "com.brain2.app",
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-app-icon.png",
      backgroundColor: "#E4DFDA",
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "brain2-psi.vercel.app",
            pathPrefix: "/expo",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  extra: {
    eas: {
      projectId: "3e56e40b-a851-4928-a2ff-ef3cc74a8263",
    },
    // Publishable key, this is not sensitive
    clerkPublishableKey: "pk_test_ZXhwZXJ0LWVsay01Ny5jbGVyay5hY2NvdW50cy5kZXYk",
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router", "./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
