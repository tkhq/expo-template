import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState, useCallback } from "react";
import { makeRedirectUri } from "expo-auth-session";
import { Button } from "../ui/button";
import { Platform, View } from "react-native";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_REDIRCT_URI,
  OAUTH_TOKEN_EXPIRATION_SECONDS,
} from "~/lib/constants";
import * as Crypto from "expo-crypto";
import GoogleIcon from "../../assets/svgs/google.svg";
import AppleIcon from "../../assets/svgs/apple.svg";
import { useTurnkey } from "@turnkey/sdk-react-native";

interface OAuthProps {
  onSuccess: (params: {
    oidcToken: string;
    providerName: string;
    targetPublicKey: string;
    expirationSeconds: string;
  }) => Promise<void>;
}

interface AuthButtonProps extends OAuthProps {
  nonce: string | null;
  targetPublicKey: string | null;
  refreshNonce: () => Promise<void>;
}

export const GoogleAuthButton: React.FC<AuthButtonProps> = ({
  onSuccess,
  nonce,
  targetPublicKey,
  refreshNonce,
}) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.select({
      ios: GOOGLE_IOS_CLIENT_ID,
      android: GOOGLE_ANDROID_CLIENT_ID,
    }),
    redirectUri: makeRedirectUri({
      native: GOOGLE_REDIRCT_URI,
    }),
    scopes: ["openid", "profile", "email"],
    extraParams: nonce ? { nonce } : {},
  });

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success" && targetPublicKey) {
        const { id_token } = response.params;

        await onSuccess({
          oidcToken: id_token,
          providerName: "google",
          targetPublicKey,
          expirationSeconds: OAUTH_TOKEN_EXPIRATION_SECONDS,
        });

        // we refresh the nonce before authentication to ensure a new one is used
        // if the user logs out and logs in with oaAuth again
        await refreshNonce();
      }
    };

    handleResponse();
  }, [response]);

  return (
    <Button
      onPress={() => promptAsync()}
      className="border border-black rounded-xl bg-transparent flex-row items-center justify-center flex-1 h-16"
      disabled={!request || !nonce || !targetPublicKey}
    >
      <View className="flex flex-col items-center justify-center">
        <GoogleIcon width={28} height={28} />
      </View>
    </Button>
  );
};

export const AppleAuthButton: React.FC<AuthButtonProps> = ({
  onSuccess,
  nonce,
  targetPublicKey,
  refreshNonce,
}) => {
  const handleAppleAuth = async () => {
    try {
      if (!nonce) {
        console.error("Nonce is not ready");
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });

      if (credential.identityToken && targetPublicKey) {
        await onSuccess({
          oidcToken: credential.identityToken,
          providerName: "apple",
          targetPublicKey,
          expirationSeconds: OAUTH_TOKEN_EXPIRATION_SECONDS,
        });

        // we refresh the nonce before authentication to ensure a new one is used
        // if the user logs out and logs in with oaAuth again
        await refreshNonce();
      }
    } catch (error) {
      console.error("Apple Sign-In Error:", error);
    }
  };

  return (
    <Button
      onPress={handleAppleAuth}
      className="border border-black rounded-xl bg-transparent flex-row items-center justify-center flex-1 h-16"
      disabled={!nonce || !targetPublicKey}
    >
      <View className="flex flex-col items-center justify-center">
        <AppleIcon width={28} height={28} />
      </View>
    </Button>
  );
};

/**
 * The nonce is a unique, cryptographically secure string used to ensure the authenticity and integrity
 * of each authentication request. In our implementation, we generate the nonce by hashing the embedded public key.
 *
 * Key purposes:
 * 1. Prevent Replay Attacks: By using a unique nonce per session, we help ensure that an intercepted token
 *    cannot be reused maliciously.
 * 2. Tie the Authentication Request to the Response: The nonce is included in the OAuth flow so that the identity token
 *    received from providers (Google or Apple) is bound to the specific authentication request.
 *
 * After a successful authentication, the nonce is refreshed to guarantee that every new authentication flow uses
 * a unique value.
 */
export const useEmbeddedKeyAndNonce = () => {
  const { createEmbeddedKey } = useTurnkey();

  const [targetPublicKey, setTargetPublicKey] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);

  const generateNonce = useCallback(async () => {
    try {
      const pubKey = await createEmbeddedKey();
      setTargetPublicKey(pubKey);

      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pubKey,
      );
      setNonce(hashedNonce);
    } catch (error) {
      console.error("Error generating nonce and public key:", error);
    }
  }, [createEmbeddedKey]);

  useEffect(() => {
    generateNonce();
  }, [generateNonce]);

  return { targetPublicKey, nonce, refreshNonce: generateNonce };
};

export const OAuth: React.FC<OAuthProps> = (props) => {
  const { onSuccess } = props;

  const { targetPublicKey, nonce, refreshNonce } = useEmbeddedKeyAndNonce();

  return (
    <View className="flex flex-row items-center justify-center w-full gap-4">
      <GoogleAuthButton
        onSuccess={onSuccess}
        nonce={nonce}
        targetPublicKey={targetPublicKey}
        refreshNonce={refreshNonce}
      />
      <AppleAuthButton
        onSuccess={onSuccess}
        nonce={nonce}
        targetPublicKey={targetPublicKey}
        refreshNonce={refreshNonce}
      />
    </View>
  );
};
