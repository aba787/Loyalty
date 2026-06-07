import { useGetMyReferrals, useGetMyProfile } from "@workspace/api-client-react";
import { UserPlus, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  confirmed: "bg-green-950/30 text-green-400 border-green-700/50",
  rejected: "bg-red-950/30 text-red-400 border-red-700/50",
};

export default function PortalReferrals() {
  const { data: referrals, isLoading } = useGetMyReferrals();
  const { data: profile } = useGetMyProfile();
  const [copied, setCopied] = useState(false);

  const confirmed = (referrals ?? []).filter((r) => r.status === "confirmed").length;
  const pending = (referrals ?? []).filter((r) => r.status === "pending").length;
  const totalReward = (referrals ?? [])
    .filter((r) => r.status === "confirmed" && r.rewardType === "points")
    .reduce((s, r) => s + Number(r.rewardValue), 0);

  const copyCode = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Referrals</h1>
      <p className="text-muted-foreground mb-6">{referrals?.length ?? 0} total referrals</p>

      {profile && (
        <div className="p-4 rounded-xl border border-border bg-card mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your referral code — share with friends to earn bonus points!</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-xl font-extrabold text-primary font-mono">{profile.referralCode}</code>
            <Button variant="outline" onClick={copyCode} className="gap-2 shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl font-extrabold">{confirmed}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl font-extrabold text-yellow-400">{pending}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl font-extrabold text-primary">+{totalReward}</p>
          <p className="text-xs text-muted-foreground mt-1">Points Earned</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (referrals ?? []).length === 0 ? (
        <div className="text-center py-20">
          <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No referrals yet. Share your code to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(referrals ?? []).map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                {r.referredName?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{r.referredName ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border block ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</span>
                <p className="text-xs text-primary font-semibold">
                  {r.rewardType === "points" ? `+${r.rewardValue} pts` : `${r.rewardValue}% comm.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
