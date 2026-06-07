import { useGetMyServices } from "@workspace/api-client-react";
import { Scissors } from "lucide-react";

export default function PortalServices() {
  const { data: services, isLoading } = useGetMyServices();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Services</h1>
      <p className="text-muted-foreground mb-6">{services?.length ?? 0} services completed</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : (services ?? []).length === 0 ? (
        <div className="text-center py-20">
          <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No services yet. Visit us to start earning points!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(services ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{s.name}</p>
                {s.description && <p className="text-sm text-muted-foreground truncate">{s.description}</p>}
                <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold">${Number(s.amount).toFixed(2)}</p>
                <p className="text-sm text-primary font-semibold">+{s.pointsEarned} pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
