import { useGetMyProfile, useGetMyDiscounts } from "@workspace/api-client-react";
import { Crown, Copy, Check, TrendingUp, Scissors, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TIER_COLORS: Record<string, string> = {
  Bronze: "from-amber-900/50 to-amber-950/80 border-amber-800/50 text-amber-400",
  Silver: "from-slate-700/50 to-slate-800/80 border-slate-500/50 text-slate-300",
  Gold: "from-yellow-900/40 to-yellow-950/80 border-yellow-700/50 text-yellow-400",
  Platinum: "from-slate-600/50 to-slate-800/80 border-slate-500/60 text-slate-200",
};

const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"];
const TIER_THRESHOLDS: Record<string, number> = { Bronze: 0, Silver: 500, Gold: 2000, Platinum: 5000 };

export default function PortalHome() {
  const { data: profile } = useGetMyProfile();
  const { data: discounts } = useGetMyDiscounts();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTierIndex = TIER_ORDER.indexOf(profile?.membershipLevel ?? "Bronze");
  const nextTier = TIER_ORDER[currentTierIndex + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
  const currentPoints = profile?.totalPoints ?? 0;
  const progressToNext = nextThreshold
    ? Math.min(100, (currentPoints / nextThreshold) * 100)
    : 100;

  const referralLink = profile
    ? `${window.location.origin}?ref=${profile.referralCode}`
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name?.split(" ")[0] ?? ""}!</h1>
        <p className="text-muted-foreground">Here's your loyalty overview.</p>
      </div>

      {profile && (
        <div className={`rounded-2xl border bg-gradient-to-br p-6 ${TIER_COLORS[profile.membershipLevel] ?? ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium opacity-70">{profile.membershipLevel} Member</p>
                <p className="text-4xl font-extrabold font-mono">{currentPoints.toLocaleString()} <span className="text-lg font-normal opacity-60">pts</span></p>
              </div>
            </div>
            <div className="text-right text-sm opacity-70">
              <p>Total Spent</p>
              <p className="text-xl font-bold opacity-100">${Number(profile.totalSpent).toFixed(2)}</p>
            </div>
          </div>
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs mb-1 opacity-70">
                <span>{profile.membershipLevel}</span>
                <span>{nextTier} at {TIER_THRESHOLDS[nextTier]?.toLocaleString()} pts</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${progressToNext}%` }} />
              </div>
              <p className="text-xs mt-1 opacity-60">{nextThreshold ? Math.max(0, nextThreshold - currentPoints).toLocaleString() : 0} pts to {nextTier}</p>
            </div>
          )}
          {!nextTier && <p className="text-sm opacity-70 mt-2">🏆 You've reached the highest tier!</p>}
        </div>
      )}

      {discounts && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Discounts</h2>
          <div className="grid grid-cols-3 gap-3">
            {discounts.discountTiers.map((tier) => (
              <div key={tier.pointsRequired} className={`p-4 rounded-xl border text-center transition-all ${tier.achieved ? "border-primary/50 bg-primary/10" : "border-border bg-card opacity-60"}`}>
                <p className={`text-2xl font-extrabold ${tier.achieved ? "text-primary" : "text-muted-foreground"}`}>{tier.discountPercent}%</p>
                <p className="text-xs text-muted-foreground mt-1">{tier.pointsRequired.toLocaleString()} pts</p>
                {tier.achieved && <span className="text-xs text-primary font-medium">✓ Unlocked</span>}
              </div>
            ))}
          </div>
          {discounts.availableDiscount > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm text-center">
              🎉 You have a <strong>{discounts.availableDiscount}% discount</strong> available on your next purchase!
            </div>
          )}
        </div>
      )}

      {profile && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Referral Code</h2>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <code className="flex-1 text-lg font-bold text-primary font-mono">{profile.referralCode}</code>
            <Button variant="outline" onClick={copyCode} className="gap-2 shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Share this code with friends. When they join, you'll earn bonus points!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/portal/services", icon: Scissors, label: "View Services", desc: `${profile?.servicesCount ?? 0} completed` },
          { href: "/portal/points", icon: TrendingUp, label: "Point History", desc: `${currentPoints.toLocaleString()} pts total` },
          { href: "/portal/referrals", icon: UserPlus, label: "My Referrals", desc: `${profile?.referralCount ?? 0} referrals` },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors block">
            <Icon className="w-6 h-6 text-primary mb-2" />
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
