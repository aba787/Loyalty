import { useState } from "react";
import { useListAllPoints, useListCustomers, useAdjustPoints, getListAllPointsQueryKey, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPoints() {
  const { data: transactions, isLoading } = useListAllPoints();
  const { data: customers } = useListCustomers();
  const adjustMutation = useAdjustPoints();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: "", points: "", type: "earn", reason: "" });

  const filtered = (transactions ?? []).filter((t) =>
    (t.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    t.reason.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdjust = async () => {
    await adjustMutation.mutateAsync({
      customerId: Number(form.customerId),
      data: { points: Number(form.points), type: form.type as "earn" | "deduct", reason: form.reason },
    });
    qc.invalidateQueries({ queryKey: getListAllPointsQueryKey() });
    qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    setOpen(false);
    setForm({ customerId: "", points: "", type: "earn", reason: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Points</h1>
          <p className="text-muted-foreground">{transactions?.length ?? 0} total transactions</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Adjust Points</Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer or reason…" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {["Customer", "Points", "Type", "Reason", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{t.customerName ?? "—"}</td>
                  <td className={`px-4 py-3 font-bold ${t.points > 0 ? "text-green-400" : "text-red-400"}`}>
                    {t.points > 0 ? "+" : ""}{t.points}
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-secondary px-2 py-0.5 rounded">{t.type}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{t.reason}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No point transactions found.</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Adjust Points</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer *</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
                <SelectContent>{(customers ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn">Earn (Add)</SelectItem>
                  <SelectItem value="deduct">Deduct (Remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Points *</Label><Input type="number" min={1} value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} /></div>
            <div><Label>Reason *</Label><Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={!form.customerId || !form.points || !form.reason || adjustMutation.isPending}>
              {adjustMutation.isPending ? "Saving…" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
