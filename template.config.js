module.exports = {
  replace: [
    {
      files: "package.json",
      replaceContent: {
        "expo-template": "__APP_NAME__",
      },
    },
    {
      files: "app.json",
      replaceContent: {
        "expo-template": "__APP_NAME__",
      },
    },
  ],
};
