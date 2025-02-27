# Expo Turnkey Template

## Overview

This template is a starter kit for quickly setting up a Turnkey-powered React Native Expo app. It simplifies the process of building authentication flows and handling backend integration, making it much easier and faster to develop secure apps. Connecting your frontend to a backend for authentication can be cumbersome, but this template streamlines the setup so you can focus on building cool features.

It includes authentication options such as:

- **Passkey Authentication**
- **OTP Authentication (Email/SMS)**
- **OAuth Authentication (Google, Apple)**

  ![image](https://github.com/user-attachments/assets/25617d29-12fd-48d2-bf4b-4f1e3f1e223e)


## Why Do We Need a Backend?

Turnkey requires authentication requests (sign-up/login) to be validated (stamped) using your root user API key-pair. Since this key-pair must remain private, it **cannot** be used directly in the frontend. Instead, authentication requests must be processed and stamped through a backend server before being forwarded to Turnkey.

> **Note**: While this template provides an **example-server** for a quickstart, it is intended as a reference implementation. You will eventually need to set up your own backend to properly integrate with your infrastructure.

## Installation

### 1. Create a new Expo app from the template

```sh
npx create-expo-app --template https://github.com/tkhq/expo-template
```

This will prompt you for an app name, which will be used to set up your project. The folder, `app.json`, and `package.json` will all be named accordingly.

### 2. Choose Your Authentication Setup

After the project is created, you will be prompted to choose how to handle authentication:

- **Use Example Server**: This option sets up authentication using the provided example backend. Everything is already configured, and authentication requests will automatically work with the example backend.

- **Hook Up Your Own Backend**: This requires you to configure your backend and update authentication requests manually. See [Setting Up Your Own Backend](#setting-up-your-own-backend) for details.

> **Note**: If you do not see the prompt, run:
>
> ```sh
> npm run postinstall
> ```

### 3. Navigate into your new project directory

```sh
cd <app-name>
```

### 4. Set Up Environment Variables

Both the frontend and backend require environment variables to function properly. The instructions below provide setup details for the example-server, but if you are using your own backend, adjust accordingly.

#### Frontend (`.env` in `mp-app`)

```ini
## General App Info
EXPO_PUBLIC_PASSKEY_APP_NAME="<your_app_name>"
EXPO_PUBLIC_RPID="<your_rpid_domain>"
EXPO_PUBLIC_BACKEND_API_URL="<your_backend_api_url>"

## Turnkey Configuration
EXPO_PUBLIC_TURNKEY_ORGANIZATION_ID="<your_turnkey_organization_id>"
EXPO_PUBLIC_TURNKEY_API_URL="https://api.turnkey.com"

## Google OAuth Credentials
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID="<your_google_ios_client_id>"
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID="<your_google_android_client_id>"
```

#### Backend (`.env` in `example-server`)

```ini
TURNKEY_API_URL="https://api.turnkey.com"
TURNKEY_ORGANIZATION_ID="<your_turnkey_organization_id>"

TURNKEY_API_PUBLIC_KEY="<your_turnkey_api_public_key>"
TURNKEY_API_PRIVATE_KEY="<your_turnkey_api_private_key>"
```

### 5. Start the development server (iOS by default)

```sh
npm run dev
```

### 6. Start the example backend server (if using it)

If you are using the example backend, navigate to the server directory and start it:

```sh
cd example-server
npm install
npm run start
```

## Authentication Provider Overview

The authentication logic is handled in `auth-provider.tsx` using React Context. This provider manages authentication states and methods such as:

### Key Authentication Methods

- **OTP Login** (email/phone)
- **Passkey Authentication**
- **OAuth Authentication**

### Core Functions:

- `initOtpLogin({ otpType, contact })`: Initiates OTP authentication.
- `completeOtpAuth({ otpId, otpCode, organizationId })`: Completes OTP authentication.
- `signUpWithPasskey()`: Registers a user with Passkeys.
- `loginWithPasskey()`: Authenticates a user using Passkeys.
- `loginWithOAuth({ oidcToken, providerName, targetPublicKey, expirationSeconds })`: Logs in a user with OAuth providers.

## Setting Up Your Own Backend

### Required Endpoints

When setting up your backend, you can refer to the [**example-server**](https://github.com/tkhq/expo-template/tree/main/example-server)
implementation as a guide. Below are the authentication endpoints your backend should define:

#### Mandatory Endpoints

`createSubOrg` - Creates a new sub-organization in Turnkey.

`getSubOrgIds` - Retrieves sub-organization IDs based on user filters.

#### Optional Endpoints (depending on implementation)

`initOtpAuth`, `otpAuth` - Required for logging in via OTP (email or SMS).

`oauthLogin` - Required for logging in via an OIDC-compliant OAuth provider.

> **Note**: The example-server is intended as a quickstart guide. For production use, you will need to build and maintain your own backend that meets your specific needs.

After setting up your backend, follow these steps to connect it to your app:

### 1. Update `BACKEND_API_URL` in `auth-provider.tsx`:

```ts
const BACKEND_API_URL = "https://your-backend.com/api";
```

### 2. Replace the placeholder requests with actual backend calls, for example:

```ts
const response = await fetch(`${BACKEND_API_URL}/auth/initOtpAuth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ otpType, contact }),
});
```

Your backend should be set up to properly stamp and relay authentication requests to Turnkey.
