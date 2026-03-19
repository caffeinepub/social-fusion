import { Fingerprint, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useBiometricLock } from "../hooks/useBiometricLock";

interface Props {
  onUnlock: () => void;
}

const PIN_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
] as const;

export default function BiometricLockScreen({ onUnlock }: Props) {
  const { isSupported, authenticate, checkPin } = useBiometricLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [trying, setTrying] = useState(false);
  const [showPin, setShowPin] = useState(!isSupported);
  const [shake, setShake] = useState(false);

  const handleBioAuth = async () => {
    if (trying) return;
    setTrying(true);
    setError("");
    const ok = await authenticate();
    setTrying(false);
    if (ok) {
      onUnlock();
    } else {
      setError("Authentication failed. Try PIN instead.");
      setShowPin(true);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (checkPin(next)) {
        onUnlock();
      } else {
        setShake(true);
        setError("Incorrect PIN");
        setTimeout(() => {
          setPin("");
          setError("");
          setShake(false);
        }, 700);
      }
    }
  };

  const handlePinDelete = () => {
    setError("");
    setPin((p) => p.slice(0, -1));
  };

  return (
    <motion.div
      data-ocid="biometric.modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #2d0a4e 0%, #0a0a0f 60%), linear-gradient(180deg, #1a0a2e 0%, #0a0a0f 100%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* App icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: -8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          delay: 0.05,
          type: "spring",
          stiffness: 300,
          damping: 22,
        }}
        className="mb-5"
      >
        <div
          className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
            boxShadow:
              "0 8px 32px rgba(236,72,153,0.45), 0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          <Lock className="w-9 h-9 text-white" strokeWidth={2.5} />
        </div>
      </motion.div>

      <motion.h2
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="text-white text-[22px] font-bold tracking-tight mb-1"
      >
        ​
      </motion.h2>
      <motion.p
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.17 }}
        className="text-white/40 text-sm mb-8"
      >
        {showPin ? "Enter your PIN" : "Authenticate to continue"}
      </motion.p>

      {/* Biometric view */}
      {!showPin && isSupported ? (
        <motion.button
          type="button"
          data-ocid="biometric.primary_button"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.22,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          onClick={handleBioAuth}
          disabled={trying}
          className="flex flex-col items-center gap-4 active:scale-95 transition-transform"
        >
          {/* Layered pulse rings */}
          <div className="relative flex items-center justify-center">
            {[1, 1.55, 2.1].map((scale, ri) => (
              <motion.div
                key={String(scale)}
                className="absolute rounded-full"
                animate={{ scale: [1, scale, 1], opacity: [0.35, 0, 0.35] }}
                transition={{
                  duration: 2.4,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: ri * 0.55,
                  ease: "easeInOut",
                }}
                style={{
                  width: 96,
                  height: 96,
                  background:
                    "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)",
                }}
              />
            ))}
            <motion.div
              animate={trying ? { rotate: 360 } : {}}
              transition={{
                duration: 1.6,
                repeat: trying ? Number.POSITIVE_INFINITY : 0,
                ease: "linear",
              }}
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(236,72,153,0.12)",
                border: "2px solid rgba(236,72,153,0.5)",
                boxShadow:
                  "0 0 32px rgba(236,72,153,0.2), inset 0 0 16px rgba(168,85,247,0.1)",
              }}
            >
              <Fingerprint
                className="w-12 h-12"
                style={{ color: trying ? "#a855f7" : "#ec4899" }}
              />
            </motion.div>
          </div>
          <motion.span
            className="text-sm font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            style={{ color: trying ? "#a855f7" : "rgba(255,255,255,0.55)" }}
          >
            {trying ? "Authenticating…" : "Touch to unlock"}
          </motion.span>
        </motion.button>
      ) : (
        /* PIN view */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="flex flex-col items-center gap-7"
        >
          {/* PIN dots */}
          <motion.div
            className="flex gap-5"
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.35 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: pin.length > i ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.18 }}
                className="w-[14px] h-[14px] rounded-full"
                style={{
                  background:
                    pin.length > i
                      ? error
                        ? "#ef4444"
                        : "linear-gradient(135deg, #ec4899, #a855f7)"
                      : "transparent",
                  border: `2px solid ${pin.length > i ? "transparent" : error ? "#ef4444" : "rgba(236,72,153,0.5)"}`,
                  boxShadow:
                    pin.length > i && !error
                      ? "0 0 8px rgba(236,72,153,0.6)"
                      : "none",
                  transition: "all 0.15s ease",
                }}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs -mt-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Standard PIN pad: 1–9, then [empty, 0, ⌫] */}
          <div className="flex flex-col gap-3">
            {PIN_ROWS.map((row) => (
              <div key={row.join("-")} className="flex gap-3">
                {row.map((d) =>
                  d === "" ? (
                    <div key="spacer" className="w-[72px] h-[72px]" />
                  ) : (
                    <motion.button
                      key={d}
                      type="button"
                      data-ocid={
                        d === "⌫"
                          ? "biometric.delete_button"
                          : "biometric.button"
                      }
                      onClick={() =>
                        d === "⌫" ? handlePinDelete() : handlePinInput(d)
                      }
                      whileTap={{ scale: 0.88 }}
                      className="w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center"
                      style={{
                        background:
                          d === "⌫"
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(255,255,255,0.07)",
                        border:
                          d === "⌫"
                            ? "1.5px solid rgba(239,68,68,0.25)"
                            : "1.5px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: d === "⌫" ? 20 : 22,
                          color: d === "⌫" ? "rgba(239,68,68,0.8)" : "white",
                          lineHeight: 1,
                        }}
                      >
                        {d}
                      </span>
                    </motion.button>
                  ),
                )}
              </div>
            ))}
          </div>

          {isSupported && (
            <button
              type="button"
              data-ocid="biometric.secondary_button"
              onClick={() => {
                setShowPin(false);
                setError("");
                setPin("");
              }}
              className="text-sm mt-1"
              style={{ color: "rgba(168,85,247,0.8)" }}
            >
              Use biometrics instead
            </button>
          )}
        </motion.div>
      )}

      {isSupported && !showPin && (
        <button
          type="button"
          data-ocid="biometric.secondary_button"
          onClick={() => setShowPin(true)}
          className="mt-10 text-sm"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Use PIN instead
        </button>
      )}
    </motion.div>
  );
}
