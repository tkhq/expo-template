export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(241.31deg 100% 64.12%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(241.31deg 100% 64.12%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL ?? "";

export const TURNKEY_API_URL = process.env.EXPO_PUBLIC_TURNKEY_API_URL ?? "";
export const TURNKEY_PARENT_ORG_ID =
  process.env.EXPO_PUBLIC_TURNKEY_ORGANIZATION_ID ?? "";

export const RP_ID = process.env.EXPO_PUBLIC_RPID ?? "";
export const PASSKEY_APP_NAME = process.env.EXPO_PUBLIC_PASSKEY_APP_NAME ?? "";

export const OAUTH_TOKEN_EXPIRATION_SECONDS = "3600";
export const GOOGLE_REDIRCT_URI =
  process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ?? "";
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
