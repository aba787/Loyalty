import { useGetMyPoints, useGetMyDiscounts } from "@workspace/api-client-react";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";

export default function PortalPoints() {
  const { data: transactions, isLoading } = useGetMyPoints();
  const { data: discounts } = useGetMyDiscounts();

  const totalEarned = (transactions ?? []).filter((t) => t.points > 0).reduce((s, t) => s + t.points, 0);
  const totalDeducted = Math.abs((transactions ?? []).filter((t) => t.points < 0).reduce((s, t) => s + t.points, 0));

  const TYPE_LABELS: Record<string, string> = {
    earn: "Earned",
    deduct: "Deducted",
    referral_bonus: "Referral Bonus",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Point History</h1>
      <p className="text-muted-foreground mb-6">{transactions?.length ?? 0} transactions</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl font-extrabold text-primary">{discounts?.currentPoints?.toLocaleString() ?? "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Balance</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl font-extrabold text-green-400">+{totalEarned.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <p className="text-2xl font-extrabold text-red-400">-{totalDeducted.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Used</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (transactions ?? []).length === 0 ? (
        <div className="text-center py-20">
          <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No point transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(transactions ?? []).map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.points > 0 ? "bg-green-950/50" : "bg-red-950/50"}`}>
                {t.points > 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{t.reason}</p>
                <p className="text-xs text-muted-foreground">{TYPE_LABELS[t.type] ?? t.type} · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <p className={`text-lg font-bold shrink-0 ${t.points > 0 ? "text-green-400" : "text-red-400"}`}>
                {t.points > 0 ? "+" : ""}{t.points}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
