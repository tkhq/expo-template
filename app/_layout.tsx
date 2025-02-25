import "~/global.css"
import { DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NAV_THEME } from "~/lib/constants";
import { Providers } from "~/providers";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      ...DefaultTheme.fonts.regular,
      fontFamily: "Inter_400Regular",
    },
    medium: {
      ...DefaultTheme.fonts.medium,
      fontFamily: "Inter_500Medium",
    },
    bold: {
      ...DefaultTheme.fonts.bold,
      fontFamily: "Inter_700Bold",
      fontWeight: "700",
    },
    heavy: {
      ...DefaultTheme.fonts.heavy,
      fontFamily: "Inter_800ExtraBold",
    },
  },
};

export default function RootLayout() {
  return (
    <Providers>
      <ThemeProvider value={LIGHT_THEME}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="dashboard"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="otp-auth"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar backgroundColor="transparent" />
      </ThemeProvider>
    </Providers>
  );
}
