/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache.forever();

  return {
    presets: [
      [
        "babel-preset-expo",
        { jsxImportSource: "nativewind" },
        "module:metro-react-native-babel-preset",
      ],
      "nativewind/babel",
    ],
    plugins: [
      require.resolve("expo-router/babel"),
      require.resolve("react-native-reanimated/plugin"),
      require.resolve("react-native-paper/babel"),
    ],
  };
};
