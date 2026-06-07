import { useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { Home, Scissors, Coins, UserPlus, DollarSign, LogOut, ChevronRight, Menu, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetAuthMe } from "@workspace/api-client-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: customer } = useGetAuthMe();

  const links = [
    { href: "/portal", label: "Home", icon: Home },
    { href: "/portal/services", label: "My Services", icon: Scissors },
    { href: "/portal/points", label: "My Points", icon: Coins },
    { href: "/portal/referrals", label: "My Referrals", icon: UserPlus },
    { href: "/portal/commissions", label: "My Commissions", icon: DollarSign },
  ];

  const getMembershipColor = (level: string = '') => {
    switch(level.toLowerCase()) {
      case 'platinum': return 'text-slate-200 bg-slate-800 border-slate-600 shadow-[0_0_15px_rgba(203,213,225,0.2)]';
      case 'gold': return 'text-yellow-400 bg-yellow-950/30 border-yellow-700/50 shadow-[0_0_15px_rgba(250,204,21,0.15)]';
      case 'silver': return 'text-slate-300 bg-slate-800/50 border-slate-500/50';
      case 'bronze': return 'text-amber-600 bg-amber-950/30 border-amber-800/50';
      default: return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-background border-r border-border">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.svg" alt="LoyalPro" className="w-8 h-8" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-600">LoyalPro</span>
      </div>

      {customer && (
        <div className="px-4 mb-6">
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden ${getMembershipColor(customer.membershipLevel)}`}>
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Crown className="w-12 h-12" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">{customer.membershipLevel}</span>
            <div className="text-3xl font-bold font-mono tracking-tight relative z-10 flex items-center gap-1">
              {customer.totalPoints.toLocaleString()} <span className="text-sm font-normal opacity-70">pts</span>
            </div>
          </div>
        </div>
      )}
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/portal" && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <link.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {link.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        {customer && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden font-bold text-primary">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
              <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
            </div>
          </div>
        )}
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground border-border bg-transparent" onClick={() => signOut({ redirectUrl: "/" })}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      <div className="hidden md:block w-64 flex-shrink-0 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-border bg-background">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold">LoyalPro</span>
          {customer && (
            <div className="ml-auto text-sm font-bold text-primary">
              {customer.totalPoints} pts
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}