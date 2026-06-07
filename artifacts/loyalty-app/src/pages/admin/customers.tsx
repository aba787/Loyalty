import { useState } from "react";
import { useListCustomers, useCreateCustomer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getListCustomersQueryKey } from "@workspace/api-client-react";

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-amber-950/40 text-amber-600 border-amber-800/50",
  Silver: "bg-slate-800/50 text-slate-300 border-slate-500/50",
  Gold: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  Platinum: "bg-slate-800 text-slate-200 border-slate-600",
};

export default function AdminCustomers() {
  const { data: customers, isLoading } = useListCustomers();
  const createMutation = useCreateCustomer();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", referredByCode: "" });

  const filtered = (customers ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.referralCode.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      data: { name: form.name, email: form.email, phone: form.phone || undefined, referredByCode: form.referredByCode || undefined },
    });
    qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    setOpen(false);
    setForm({ name: "", email: "", phone: "", referredByCode: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">{customers?.length ?? 0} total customers</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or referral code…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {["Name", "Email", "Referral Code", "Points", "Spent", "Tier", "Referrals", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3">
                    <code className="bg-secondary px-2 py-0.5 rounded text-xs">{c.referralCode}</code>
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">{c.totalPoints.toLocaleString()}</td>
                  <td className="px-4 py-3">${Number(c.totalSpent).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[c.membershipLevel] ?? ""}`}>
                      {c.membershipLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.referralCount}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/customers/${c.id}`)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No customers found.</div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" type="email" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <Label>Referred By Code</Label>
              <Input value={form.referredByCode} onChange={(e) => setForm((f) => ({ ...f, referredByCode: e.target.value }))} placeholder="ABC12345" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.email || createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
