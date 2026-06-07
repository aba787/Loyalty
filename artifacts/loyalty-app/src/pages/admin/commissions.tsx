import { useListAllCommissions, useUpdateCommission, getListAllCommissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  paid: "bg-green-950/30 text-green-400 border-green-700/50",
};

export default function AdminCommissions() {
  const { data: commissions, isLoading } = useListAllCommissions();
  const updateMutation = useUpdateCommission();
  const qc = useQueryClient();

  const total = (commissions ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const paid = (commissions ?? []).filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
  const pending = total - paid;

  const handleMarkPaid = async (id: number) => {
    await updateMutation.mutateAsync({ id, data: { status: "paid" } });
    qc.invalidateQueries({ queryKey: getListAllCommissionsQueryKey() });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Commissions</h1>
        <p className="text-muted-foreground">{commissions?.length ?? 0} total commission records</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Commissions", value: `$${total.toFixed(2)}` },
          { label: "Paid", value: `$${paid.toFixed(2)}`, color: "text-green-400" },
          { label: "Pending", value: `$${pending.toFixed(2)}`, color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {["Customer", "Amount", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(commissions ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{c.customerName ?? "—"}</td>
                  <td className="px-4 py-3 font-bold">${Number(c.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[c.status] ?? ""}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {c.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkPaid(c.id)} className="gap-1 text-green-400 border-green-700/50 hover:bg-green-950/30">
                        <DollarSign className="w-3 h-3" /> Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(commissions ?? []).length === 0 && <div className="text-center py-16 text-muted-foreground">No commissions yet.</div>}
        </div>
      )}
    </div>
  );
}
