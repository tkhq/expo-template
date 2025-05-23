import { ReactNode, createContext, useReducer } from "react";
import { TurnkeyClient } from "@turnkey/http";
import {
  createPasskey,
  isSupported,
  PasskeyStamper,
} from "@turnkey/react-native-passkey-stamper";
import { useRouter } from "expo-router";
import { LoginMethod } from "~/lib/types";
import {
  BACKEND_API_URL,
  PASSKEY_APP_NAME,
  RP_ID,
  TURNKEY_API_URL,
  TURNKEY_PARENT_ORG_ID,
} from "~/lib/constants";
import { User, useTurnkey } from "@turnkey/sdk-react-native";
import { v4 as uuidv4 } from 'uuid';

type AuthActionType =
  | { type: "PASSKEY"; payload: User }
  | { type: "INIT_EMAIL_AUTH" }
  | { type: "COMPLETE_EMAIL_AUTH"; payload: User }
  | { type: "INIT_PHONE_AUTH" }
  | { type: "COMPLETE_PHONE_AUTH"; payload: User }
  | { type: "EMAIL_RECOVERY"; payload: User }
  | { type: "WALLET_AUTH"; payload: User }
  | { type: "OAUTH"; payload: User }
  | { type: "LOADING"; payload: LoginMethod | null }
  | { type: "ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };
interface AuthState {
  loading: LoginMethod | null;
  error: string;
  user: User | null;
}

const initialState: AuthState = {
  loading: null,
  error: "",
  user: null,
};

function authReducer(state: AuthState, action: AuthActionType): AuthState {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: action.payload ? action.payload : null };
    case "ERROR":
      return { ...state, error: action.payload, loading: null };
    case "CLEAR_ERROR":
      return { ...state, error: "" };
    case "INIT_EMAIL_AUTH":
      return { ...state, loading: null, error: "" };
    case "COMPLETE_EMAIL_AUTH":
      return { ...state, user: action.payload, loading: null, error: "" };
    case "INIT_PHONE_AUTH":
      return { ...state, loading: null, error: "" };
    case "COMPLETE_PHONE_AUTH":
      return { ...state, user: action.payload, loading: null, error: "" };
    case "OAUTH":
    case "PASSKEY":
    case "EMAIL_RECOVERY":
    case "WALLET_AUTH":
    case "OAUTH":
      return { ...state, user: action.payload, loading: null, error: "" };
    default:
      return state;
  }
}

export interface AuthRelayProviderType {
  state: AuthState;
  initOtpLogin: (params: { otpType: string; contact: string }) => Promise<void>;
  completeOtpAuth: (params: {
    otpId: string;
    otpCode: string;
    organizationId: string;
  }) => Promise<void>;
  signUpWithPasskey: () => Promise<void>;
  loginWithPasskey: () => Promise<void>;
  loginWithOAuth: (params: {
    oidcToken: string;
    providerName: string;
    targetPublicKey: string;
    expirationSeconds: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const AuthRelayContext = createContext<AuthRelayProviderType>({
  state: initialState,
  initOtpLogin: async () => Promise.resolve(),
  completeOtpAuth: async () => Promise.resolve(),
  signUpWithPasskey: async () => Promise.resolve(),
  loginWithPasskey: async () => Promise.resolve(),
  loginWithOAuth: async () => Promise.resolve(),
  clearError: () => {},
});

interface AuthRelayProviderProps {
  children: ReactNode;
}

export const AuthRelayProvider: React.FC<AuthRelayProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const { createEmbeddedKey, createSession } = useTurnkey();

  const initOtpLogin = async ({
    otpType,
    contact,
  }: {
    otpType: string;
    contact: string;
  }) => {
    dispatch({
      type: "LOADING",
      payload:
        otpType === "OTP_TYPE_EMAIL" ? LoginMethod.Email : LoginMethod.Phone,
    });
    try {
      console.log(
        "TODO: Replace this with an actual backend request to initiate OTP authentication",
      );

      // <EXAMPLE:INIT_OTP_AUTH>
      // Example request - replace with your actual backend call
      /*
      const response = await fetch(`${BACKEND_API_URL}/auth/initOtpAuth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpType, contact }),
      }).then((res) => res.json());
      */
      // </EXAMPLE:INIT_OTP_AUTH>

      // <PLACEHOLDER:INIT_OTP_AUTH_RESPONSE>
      const response = {
        otpId: "otp-id",
        organizationId: "org-id",
      };
      // </PLACEHOLDER:INIT_OTP_AUTH_RESPONSE>

      if (response) {
        dispatch({ type: "INIT_EMAIL_AUTH" });
        router.push(
          `/otp-auth?otpId=${encodeURIComponent(
            response.otpId,
          )}&organizationId=${encodeURIComponent(response.organizationId)}`,
        );
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message });
    } finally {
      dispatch({ type: "LOADING", payload: null });
    }
  };

  const completeOtpAuth = async ({
    otpId,
    otpCode,
    organizationId,
  }: {
    otpId: string;
    otpCode: string;
    organizationId: string;
  }) => {
    if (otpCode) {
      dispatch({ type: "LOADING", payload: LoginMethod.Email });
      try {
        const targetPublicKey = await createEmbeddedKey();

        console.log(
          "TODO: Replace this with an actual backend request to complete OTP authentication",
        );

        // <EXAMPLE:COMPLETE_OTP_AUTH>
        // Example request - replace with your actual backend call
        /*
        const response = await fetch(`${BACKEND_API_URL}/auth/otpAuth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otpId,
            otpCode,
            organizationId,
            targetPublicKey,
            invalidateExisting: false,
          }),
        }).then((res) => res.json());
        */
        // </EXAMPLE:COMPLETE_OTP_AUTH>

        // <PLACEHOLDER:COMPLETE_OTP_AUTH_RESPONSE>
        const response = {
          credentialBundle: "credential-bundle",
        };
        // </PLACEHOLDER:COMPLETE_OTP_AUTH_RESPONSE>
        
        const credentialBundle = response.credentialBundle;
        if (credentialBundle) {
          await createSession({bundle: credentialBundle});
        }
      } catch (error: any) {
        dispatch({ type: "ERROR", payload: error.message });
      } finally {
        dispatch({ type: "LOADING", payload: null });
      }
    }
  };

  // User will be prompted twice for passkey, once for account creation and once for login
  const signUpWithPasskey = async () => {
    if (!isSupported()) {
      throw new Error("Passkeys are not supported on this device");
    }

    dispatch({ type: "LOADING", payload: LoginMethod.Passkey });

    try {
      const authenticatorParams = await createPasskey({
        authenticatorName: "End-User Passkey",
        rp: {
          id: RP_ID,
          name: PASSKEY_APP_NAME,
        },
        user: {
          id: uuidv4(),
          // Name and displayName must match
          // This name is visible to the user. This is what's shown in the passkey prompt
          name: "Anonymous User",
          displayName: "Anonymous User",
        },
      });

      console.log(
        "TODO: Replace this with an actual backend request to create a sub-organization",
      );

      // <EXAMPLE:SIGNUP_SUB_ORG>
      // Example request - replace with your actual backend call
      /*
      const response = await fetch(`${BACKEND_API_URL}/auth/createSubOrg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passkey: {
            challenge: authenticatorParams.challenge,
            attestation: authenticatorParams.attestation,
          },
        }),
      }).then((res) => res.json());
      */
      // </EXAMPLE:SIGNUP_SUB_ORG>

      // <PLACEHOLDER:SIGNUP_SUB_ORG_RESPONSE>
      const response = {
        subOrganizationId: "sub-org-id",
      };
      // </PLACEHOLDER:SIGNUP_SUB_ORG_RESPONSE>

      if (response.subOrganizationId) {
        // Successfully created sub-organization, proceed with the login flow
        const stamper = new PasskeyStamper({
          rpId: RP_ID,
        });

        const httpClient = new TurnkeyClient(
          { baseUrl: TURNKEY_API_URL },
          stamper,
        );

        const targetPublicKey = await createEmbeddedKey();

        const sessionResponse = await httpClient.createReadWriteSession({
          type: "ACTIVITY_TYPE_CREATE_READ_WRITE_SESSION_V2",
          timestampMs: Date.now().toString(),
          organizationId: TURNKEY_PARENT_ORG_ID,
          parameters: {
            targetPublicKey,
          },
        });

        const credentialBundle =
          sessionResponse.activity.result.createReadWriteSessionResultV2
            ?.credentialBundle;

        if (credentialBundle) {
          await createSession({bundle: credentialBundle});
        }
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message });
    } finally {
      dispatch({ type: "LOADING", payload: null });
    }
  };

  const loginWithPasskey = async () => {
    if (!isSupported()) {
      throw new Error("Passkeys are not supported on this device");
    }
    dispatch({ type: "LOADING", payload: LoginMethod.Passkey });

    try {
      const stamper = new PasskeyStamper({
        rpId: RP_ID,
      });

      const httpClient = new TurnkeyClient(
        { baseUrl: TURNKEY_API_URL },
        stamper,
      );

      const targetPublicKey = await createEmbeddedKey();

      const sessionResponse = await httpClient.createReadWriteSession({
        type: "ACTIVITY_TYPE_CREATE_READ_WRITE_SESSION_V2",
        timestampMs: Date.now().toString(),
        organizationId: TURNKEY_PARENT_ORG_ID,
        parameters: {
          targetPublicKey,
        },
      });

      const credentialBundle =
        sessionResponse.activity.result.createReadWriteSessionResultV2
          ?.credentialBundle;

      if (credentialBundle) {
        await createSession({bundle: credentialBundle});
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message });
    } finally {
      dispatch({ type: "LOADING", payload: null });
    }
  };

  const loginWithOAuth = async ({
    oidcToken,
    providerName,
    targetPublicKey,
    expirationSeconds,
  }: {
    oidcToken: string;
    providerName: string;
    targetPublicKey: string;
    expirationSeconds: string;
  }) => {
    dispatch({ type: "LOADING", payload: LoginMethod.OAuth });
    try {
      console.log(
        "TODO: Replace this with an actual backend request to authenticate the user with OAuth",
      );

      // <EXAMPLE:OAUTH>
      // Example request - replace with your actual backend call
      /*
      const response = await fetch(`${BACKEND_API_URL}/auth/oAuthLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oidcToken,
          providerName,
          targetPublicKey,
          expirationSeconds,
        }),
      }).then((res) => res.json());
      */
      // </EXAMPLE:OAUTH>

      // <PLACEHOLDER:OAUTH_RESPONSE>
      const response = {
        credentialBundle: "credential-bundle",
      };
      // </PLACEHOLDER:OAUTH_RESPONSE>

      const credentialBundle = response.credentialBundle;
      if (credentialBundle) {
        await createSession({bundle: credentialBundle});
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message });
    } finally {
      dispatch({ type: "LOADING", payload: null });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthRelayContext.Provider
      value={{
        state,
        initOtpLogin,
        completeOtpAuth,
        signUpWithPasskey,
        loginWithPasskey,
        loginWithOAuth,
        clearError,
      }}
    >
      {children}
    </AuthRelayContext.Provider>
  );
};
