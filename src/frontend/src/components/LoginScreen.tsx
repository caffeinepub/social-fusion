import { Button } from "@/components/ui/button";
import { Heart, Loader2, MessageCircle, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center text-center gap-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-display gradient-text">​</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Connect. Share. Discover.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[
            { icon: Heart, label: "Share moments" },
            { icon: MessageCircle, label: "Real-time chat" },
            { icon: Users, label: "Find friends" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-3"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <div className="w-full flex flex-col gap-3">
          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-12 text-base bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold rounded-2xl shadow-lg shadow-primary/30"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secure login via Internet Identity
          </p>
        </div>
      </motion.div>
    </div>
  );
}
