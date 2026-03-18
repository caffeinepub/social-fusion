import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "sf_private_profiles";

interface PrivacyContextValue {
  privateProfiles: Set<string>;
  isPrivate: (principalStr: string) => boolean;
  setMyPrivacy: (principalStr: string, isPrivate: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privateProfiles, setPrivateProfiles] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return new Set(JSON.parse(stored) as string[]);
    } catch {}
    return new Set<string>();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...privateProfiles]));
    } catch {}
  }, [privateProfiles]);

  const isPrivate = (principalStr: string) => privateProfiles.has(principalStr);

  const setMyPrivacy = (principalStr: string, priv: boolean) => {
    setPrivateProfiles((prev) => {
      const next = new Set(prev);
      if (priv) next.add(principalStr);
      else next.delete(principalStr);
      return next;
    });
  };

  return (
    <PrivacyContext.Provider
      value={{ privateProfiles, isPrivate, setMyPrivacy }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error("usePrivacy must be used within PrivacyProvider");
  return ctx;
}
