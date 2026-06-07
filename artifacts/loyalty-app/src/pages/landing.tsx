import { useClerk } from "@clerk/react";
import { Crown, Star, TrendingUp, Users, Gift, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { openSignIn } = useClerk();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="LoyalPro" className="w-8 h-8" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-600">LoyalPro</span>
        </div>
        <Button onClick={() => openSignIn({})} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Sign In
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
          <Crown className="w-4 h-4" />
          Loyalty & Referral System
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Reward Your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-amber-400 to-amber-600">
            Best Customers
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Earn points on every service, unlock exclusive membership tiers, and refer friends to earn even more rewards.
        </p>

        <Button
          size="lg"
          onClick={() => openSignIn({})}
          className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-amber-600 text-background font-bold hover:opacity-90 transition-opacity"
        >
          Get Started Free
        </Button>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          {[
            { icon: Star, title: "Earn Points", desc: "Get 1 point for every $1 spent on services. Redeem for exclusive discounts up to 15% off." },
            { icon: Award, title: "Membership Tiers", desc: "Climb from Bronze to Platinum. Higher tiers unlock better perks and priority service." },
            { icon: Users, title: "Referral Rewards", desc: "Share your referral code. Earn bonus points or commissions for every successful referral." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-border bg-card text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-8 text-center">
          {[
            { label: "Points Tiers", value: "3" },
            { label: "Membership Levels", value: "4" },
            { label: "Max Discount", value: "15%" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-4xl font-extrabold text-primary">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LoyalPro. All rights reserved.
      </footer>
    </div>
  );
}
