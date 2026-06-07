import { useGetDashboardStats, useGetMembershipBreakdown, useGetTopCustomers } from "@workspace/api-client-react";
import { Users, Coins, TrendingUp, UserPlus, DollarSign, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-amber-950/40 text-amber-600 border-amber-800/50",
  Silver: "bg-slate-800/50 text-slate-300 border-slate-500/50",
  Gold: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  Platinum: "bg-slate-800 text-slate-200 border-slate-600",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: breakdown } = useGetMembershipBreakdown();
  const { data: topCustomers } = useGetTopCustomers();

  const statCards = [
    { label: "Total Customers", value: stats?.totalCustomers ?? "—", icon: Users, color: "text-blue-400" },
    { label: "Total Points Issued", value: stats?.totalPoints?.toLocaleString() ?? "—", icon: Coins, color: "text-yellow-400" },
    { label: "Total Revenue", value: stats ? `$${Number(stats.totalRevenue).toLocaleString()}` : "—", icon: TrendingUp, color: "text-green-400" },
    { label: "Total Referrals", value: stats?.totalReferrals ?? "—", icon: UserPlus, color: "text-purple-400" },
    { label: "Commissions Paid", value: stats ? `$${Number(stats.totalCommissionsPaid).toFixed(2)}` : "—", icon: DollarSign, color: "text-emerald-400" },
    { label: "Pending Commissions", value: stats ? `$${Number(stats.pendingCommissions).toFixed(2)}` : "—", icon: DollarSign, color: "text-orange-400" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Overview of your loyalty program.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold">{statsLoading ? <span className="animate-pulse text-muted-foreground text-lg">...</span> : value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Membership Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdown?.map(({ level, count }) => (
              <div key={level} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${TIER_COLORS[level] ?? "bg-secondary text-foreground"}`}>
                  {level}
                </span>
                <span className="font-bold">{count} customers</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Top Customers by Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCustomers?.slice(0, 6).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{c.totalPoints.toLocaleString()} pts</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[c.membershipLevel] ?? ""}`}>{c.membershipLevel}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
