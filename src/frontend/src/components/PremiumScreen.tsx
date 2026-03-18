import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CheckCheck,
  ChevronRight,
  Crown,
  Eye,
  Rocket,
  Shield,
  Star,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface PremiumScreenProps {
  open: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/mo",
    badge: null,
    gradient: "from-white/10 to-white/5",
    border: "border-white/10",
    features: ["Basic swipes", "Limited likes", "Public profile"],
    cta: "Current Plan",
    ctaDisabled: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: "₹499",
    period: "/mo",
    badge: "Most Popular",
    gradient: "from-yellow-500/20 to-amber-600/10",
    border: "border-yellow-500/40",
    features: [
      "Unlimited swipes",
      "5 Super Likes/day",
      "See who liked you",
      "Boost profile (1x/week)",
    ],
    cta: "Get Gold",
    ctaDisabled: false,
  },
  {
    id: "diamond",
    name: "Diamond",
    price: "₹999",
    period: "/mo",
    badge: null,
    gradient: "from-purple-500/20 to-pink-600/10",
    border: "border-purple-500/40",
    features: [
      "Everything in Gold",
      "Unlimited Super Likes",
      "Incognito mode",
      "Priority matching",
      "Verified badge",
      "Read receipts",
    ],
    cta: "Get Diamond",
    ctaDisabled: false,
  },
];

const FEATURES: {
  icon: LucideIcon;
  title: string;
  plan: string;
  color: string;
}[] = [
  {
    icon: Rocket,
    title: "Boost Profile",
    plan: "Gold",
    color: "text-yellow-400",
  },
  { icon: Star, title: "Super Likes", plan: "Gold", color: "text-yellow-400" },
  {
    icon: Eye,
    title: "See Who Liked You",
    plan: "Gold",
    color: "text-yellow-400",
  },
  {
    icon: CheckCheck,
    title: "Read Receipts",
    plan: "Diamond",
    color: "text-purple-400",
  },
  {
    icon: Shield,
    title: "Incognito Mode",
    plan: "Diamond",
    color: "text-purple-400",
  },
  {
    icon: Zap,
    title: "Priority Matches",
    plan: "Diamond",
    color: "text-purple-400",
  },
  {
    icon: BadgeCheck,
    title: "Verified Badge",
    plan: "Diamond",
    color: "text-purple-400",
  },
  {
    icon: Rocket,
    title: "Unlimited Swipes",
    plan: "Gold",
    color: "text-yellow-400",
  },
];

export function PremiumScreen({ open, onClose }: PremiumScreenProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0f] overflow-y-auto"
          data-ocid="premium.modal"
        >
          {/* Background glow */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.1) 0%, transparent 50%)",
            }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-center pt-12 pb-4 px-4 shrink-0">
            <button
              type="button"
              data-ocid="premium.close_button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #eab308, #f59e0b, #d97706)",
                }}
              >
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h1
                className="text-2xl font-bold text-white"
                style={{
                  background:
                    "linear-gradient(to right, #eab308, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Go Premium
              </h1>
              <p className="text-white/50 text-sm text-center">
                Unlock the full Social Fusion experience
              </p>
            </div>
          </div>

          {/* Plans */}
          <div className="px-4 flex flex-col gap-3 shrink-0">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-2xl border bg-gradient-to-br ${plan.gradient} ${plan.border} p-4`}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-black"
                    style={{
                      background: "linear-gradient(to right, #eab308, #f59e0b)",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-white text-2xl font-extrabold">
                        {plan.price}
                      </span>
                      <span className="text-white/40 text-sm">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid="premium.primary_button"
                    disabled={plan.ctaDisabled}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      plan.ctaDisabled
                        ? "bg-white/10 text-white/40 cursor-default"
                        : "text-white shadow-lg"
                    }`}
                    style={
                      !plan.ctaDisabled
                        ? {
                            background:
                              "linear-gradient(to right, #ec4899, #a855f7)",
                          }
                        : undefined
                    }
                  >
                    {plan.cta}
                  </button>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-white/70 text-sm"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="px-4 mt-6 shrink-0">
            <h2 className="text-white font-bold text-base mb-3">
              Premium Features
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, plan, color }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <p className="text-white text-sm font-medium">{title}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                      plan === "Gold"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {plan}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="px-4 mt-6 mb-10 shrink-0">
            <button
              type="button"
              data-ocid="premium.submit_button"
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-base shadow-xl"
              style={{
                background:
                  "linear-gradient(to right, #ec4899, #a855f7, #6366f1)",
              }}
            >
              <Crown className="w-5 h-5" />
              Start Premium — 7 Days Free
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-white/30 text-xs text-center mt-2">
              Cancel anytime. No hidden charges.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
