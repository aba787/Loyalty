import { useListAllReferrals, useUpdateReferral, getListAllReferralsQueryKey, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  confirmed: "bg-green-950/30 text-green-400 border-green-700/50",
  rejected: "bg-red-950/30 text-red-400 border-red-700/50",
};

export default function AdminReferrals() {
  const { data: referrals, isLoading } = useListAllReferrals();
  const updateMutation = useUpdateReferral();
  const qc = useQueryClient();

  const handleUpdate = async (id: number, status: "confirmed" | "rejected") => {
    await updateMutation.mutateAsync({ id, data: { status } });
    qc.invalidateQueries({ queryKey: getListAllReferralsQueryKey() });
    qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">{referrals?.length ?? 0} total referrals</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {["Referrer", "Referred", "Reward", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(referrals ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{r.referrerName ?? "—"}</td>
                  <td className="px-4 py-3">{r.referredName ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.rewardType === "points" ? `+${r.rewardValue} pts` : `${r.rewardValue}% commission`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-green-400 hover:text-green-300" onClick={() => handleUpdate(r.id, "confirmed")}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-300" onClick={() => handleUpdate(r.id, "rejected")}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(referrals ?? []).length === 0 && <div className="text-center py-16 text-muted-foreground">No referrals yet.</div>}
        </div>
      )}
    </div>
  );
}
