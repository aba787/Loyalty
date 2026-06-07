import { useGetMyCommissions } from "@workspace/api-client-react";
import { DollarSign } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  paid: "bg-green-950/30 text-green-400 border-green-700/50",
};

export default function PortalCommissions() {
  const { data: commissions, isLoading } = useGetMyCommissions();

  const total = (commissions ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const paid = (commissions ?? []).filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
  const pending = total - paid;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Commissions</h1>
      <p className="text-muted-foreground mb-6">{commissions?.length ?? 0} commission records</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Earned", value: `$${total.toFixed(2)}` },
          { label: "Paid", value: `$${paid.toFixed(2)}`, color: "text-green-400" },
          { label: "Pending", value: `$${pending.toFixed(2)}`, color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-border bg-card text-center">
            <p className={`text-2xl font-extrabold ${color ?? ""}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (commissions ?? []).length === 0 ? (
        <div className="text-center py-20">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No commissions yet. Refer friends to earn commissions!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(commissions ?? []).map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-950/50 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Commission from referral #{c.referralId}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-lg">${Number(c.amount).toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[c.status] ?? ""}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
