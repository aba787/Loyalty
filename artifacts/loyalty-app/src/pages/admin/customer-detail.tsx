import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetCustomer, useListAllServices, useListAllPoints, useListAllReferrals, useAddService, useAdjustPoints, getListCustomersQueryKey, getGetCustomerQueryKey, getListAllServicesQueryKey, getListAllPointsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Minus, Scissors, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-amber-950/40 text-amber-600 border-amber-800/50",
  Silver: "bg-slate-800/50 text-slate-300 border-slate-500/50",
  Gold: "bg-yellow-950/30 text-yellow-400 border-yellow-700/50",
  Platinum: "bg-slate-800 text-slate-200 border-slate-600",
};

export default function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data: customer, isLoading } = useGetCustomer(customerId);
  const { data: allServices } = useListAllServices();
  const { data: allPoints } = useListAllPoints();

  const addServiceMutation = useAddService();
  const adjustPointsMutation = useAdjustPoints();

  const [serviceOpen, setServiceOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", amount: "", customPoints: "" });
  const [pointsForm, setPointsForm] = useState({ points: "", type: "earn", reason: "" });

  const myServices = (allServices ?? []).filter((s) => s.customerId === customerId);
  const myPoints = (allPoints ?? []).filter((p) => p.customerId === customerId);

  const handleAddService = async () => {
    await addServiceMutation.mutateAsync({
      customerId,
      data: {
        name: serviceForm.name,
        description: serviceForm.description || undefined,
        amount: Number(serviceForm.amount),
        customPoints: serviceForm.customPoints ? Number(serviceForm.customPoints) : undefined,
      },
    });
    qc.invalidateQueries({ queryKey: getGetCustomerQueryKey(customerId) });
    qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    qc.invalidateQueries({ queryKey: getListAllServicesQueryKey() });
    setServiceOpen(false);
    setServiceForm({ name: "", description: "", amount: "", customPoints: "" });
  };

  const handleAdjustPoints = async () => {
    await adjustPointsMutation.mutateAsync({
      customerId,
      data: { points: Number(pointsForm.points), type: pointsForm.type as "earn" | "deduct", reason: pointsForm.reason },
    });
    qc.invalidateQueries({ queryKey: getGetCustomerQueryKey(customerId) });
    qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    qc.invalidateQueries({ queryKey: getListAllPointsQueryKey() });
    setPointsOpen(false);
    setPointsForm({ points: "", type: "earn", reason: "" });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!customer) return <div className="text-center py-20 text-muted-foreground">Customer not found</div>;

  return (
    <div>
      <button onClick={() => navigate("/admin/customers")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.email}</p>
          {customer.phone && <p className="text-muted-foreground text-sm">{customer.phone}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setPointsOpen(true)} className="gap-2">
            <Coins className="w-4 h-4" /> Adjust Points
          </Button>
          <Button onClick={() => setServiceOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Points", value: customer.totalPoints.toLocaleString() },
          { label: "Total Spent", value: `$${Number(customer.totalSpent).toFixed(2)}` },
          { label: "Membership", value: <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[customer.membershipLevel] ?? ""}`}>{customer.membershipLevel}</span> },
          { label: "Referrals Made", value: customer.referralCount },
        ].map(({ label, value }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4">
        <Label className="text-sm text-muted-foreground">Referral Code</Label>
        <code className="block mt-1 bg-secondary px-3 py-2 rounded text-sm">{customer.referralCode}</code>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services ({myServices.length})</TabsTrigger>
          <TabsTrigger value="points">Point History ({myPoints.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  {["Service", "Amount", "Points Earned", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myServices.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">${Number(s.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-primary font-bold">+{s.pointsEarned}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myServices.length === 0 && <div className="text-center py-10 text-muted-foreground">No services yet</div>}
          </div>
        </TabsContent>
        <TabsContent value="points" className="mt-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  {["Points", "Type", "Reason", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myPoints.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20">
                    <td className={`px-4 py-3 font-bold ${p.points > 0 ? "text-green-400" : "text-red-400"}`}>
                      {p.points > 0 ? "+" : ""}{p.points}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded">{p.type}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myPoints.length === 0 && <div className="text-center py-10 text-muted-foreground">No point transactions yet</div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Service Name *</Label><Input value={serviceForm.name} onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))} placeholder="Haircut, Massage…" /></div>
            <div><Label>Description</Label><Textarea value={serviceForm.description} onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Amount ($) *</Label><Input type="number" min={0} value={serviceForm.amount} onChange={(e) => setServiceForm((f) => ({ ...f, amount: e.target.value }))} placeholder="50.00" /></div>
            <div><Label>Custom Points (optional)</Label><Input type="number" min={0} value={serviceForm.customPoints} onChange={(e) => setServiceForm((f) => ({ ...f, customPoints: e.target.value }))} placeholder="Leave blank to use $1=1pt" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddService} disabled={!serviceForm.name || !serviceForm.amount || addServiceMutation.isPending}>
              {addServiceMutation.isPending ? "Adding…" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pointsOpen} onOpenChange={setPointsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Adjust Points</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={pointsForm.type} onValueChange={(v) => setPointsForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn">Earn (Add)</SelectItem>
                  <SelectItem value="deduct">Deduct (Remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Points *</Label><Input type="number" min={1} value={pointsForm.points} onChange={(e) => setPointsForm((f) => ({ ...f, points: e.target.value }))} /></div>
            <div><Label>Reason *</Label><Input value={pointsForm.reason} onChange={(e) => setPointsForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Bonus, correction…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustPoints} disabled={!pointsForm.points || !pointsForm.reason || adjustPointsMutation.isPending}>
              {adjustPointsMutation.isPending ? "Saving…" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
