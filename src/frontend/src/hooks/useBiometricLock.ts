import { useState } from "react";

const ENABLED_KEY = "sf_biometric_enabled";
const CRED_KEY = "sf_biometric_cred_id";
const PIN_KEY = "sf_biometric_pin";

export function useBiometricLock() {
  const isSupported = !!window.PublicKeyCredential;
  const isEnabled = localStorage.getItem(ENABLED_KEY) === "true";
  const [isLocked, setIsLocked] = useState(isEnabled);

  const register = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Social Fusion", id: window.location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: "user@socialfusion",
            displayName: "Social Fusion User",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;
      if (cred) {
        localStorage.setItem(CRED_KEY, cred.id);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const authenticate = async (): Promise<boolean> => {
    if (!isSupported) return false;
    const credId = localStorage.getItem(CRED_KEY);
    try {
      const allowCreds: PublicKeyCredentialDescriptor[] = credId
        ? [
            {
              type: "public-key" as const,
              id: Uint8Array.from(atob(credId), (c) => c.charCodeAt(0)),
            },
          ]
        : [];
      const result = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: "required",
          allowCredentials: allowCreds,
          timeout: 60000,
        },
      });
      if (result) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const enable = async (): Promise<boolean> => {
    const ok = await register();
    if (ok) {
      localStorage.setItem(ENABLED_KEY, "true");
    }
    return ok;
  };

  const disable = () => {
    localStorage.removeItem(ENABLED_KEY);
    localStorage.removeItem(CRED_KEY);
    setIsLocked(false);
  };

  const lock = () => {
    if (isEnabled) setIsLocked(true);
  };

  const setPin = (pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
  };

  const checkPin = (pin: string): boolean => {
    const stored = localStorage.getItem(PIN_KEY) || "1234";
    if (pin === stored) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  return {
    isSupported,
    isEnabled,
    isLocked,
    register,
    authenticate,
    enable,
    disable,
    lock,
    checkPin,
    setPin,
  };
}
