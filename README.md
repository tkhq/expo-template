# Expo Template Setup Guide

## Getting Started

Follow these steps to create a new Expo project using this template.

### 1. Create a new Expo app from the template
```sh
npx create-expo-app --template https://github.com/tkhq/expo-template
```
This will prompt you to enter an app name.

### 2. Navigate into your new project directory
```sh
cd <app-name>
```

### 3. Start the development server (iOS by default)
```sh
npm run dev
```

## Setting Up Authentication

To enable user authentication (logging in and signing up) in this template, you need to set up a backend to handle authentication requests.

### Why Do We Need a Backend?
Turnkey requires authentication requests (sign-up/login) to be validated (stamped) using your root user API key-pair. Since this key-pair must remain private, it **cannot** be used directly in the frontend. Instead, authentication requests must be processed and stamped through a backend server before being forwarded to Turnkey.

### Auth Relayer Overview

This template provides an **Auth Relayer**, a simple provider that centralizes authentication requests between the frontend and backend. Instead of making direct requests to Turnkey, your frontend will send authentication requests to your backend, which then stamps and forwards them securely to Turnkey.

#### How It Works
1. Your frontend makes authentication requests to your backend.
2. Your backend **stamps** the requests before forwarding them to Turnkey.
3. Turnkey processes the request and returns a response to your backend.
4. Your backend sends the response back to the frontend.

## Connecting Authentication

Authentication functionality in this template is managed through the `auth-provider.tsx` file.

### Option 1: Quickstart (Example Server)
If you want to test authentication without setting up your own backend, you can use the **example-server** from the [React Native Demo Wallet](https://github.com/tkhq/react-native-demo-wallet) repo.

#### Steps:
1. Clone the example server:
   ```sh
   git clone https://github.com/tkhq/react-native-demo-wallet
   cd react-native-demo-wallet/example-server
   npm install
   npm run start
   ```
2. Uncomment the example requests inside `auth-provider.tsx`.

### Option 2: Hooking Up Your Own Backend
To integrate your own backend, update `BACKEND_API_URL` in `auth-provider.tsx`:

```ts
const BACKEND_API_URL = "https://your-backend.com/api";
```
Then replace the placeholder requests with actual backend calls, for example:

```ts
const response = await fetch(`${BACKEND_API_URL}/auth/initOTPAuth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ otpType, contact }),
});
```
Your backend should be set up to properly stamp and relay authentication requests to Turnkey.

#### Required Endpoints:
When setting up your backend, you can refer to the **example-server** implementation as a guide. Below are the authentication endpoints your backend should define:

##### Mandatory Endpoints:
- `createSubOrg`: Creates a new sub-organization in Turnkey.
- `getSubOrgIds`: Retrieves sub-organization IDs based on user filters.

##### Optional Endpoints (depending on implementation):
- `initOtpAuth`, `otpAuth`: Required for logging in via OTP (email or SMS).
- `oauthLogin`: Required for logging in via an OIDC-compliant OAuth provider.

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

