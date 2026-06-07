import { useClerk, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Scissors, Coins, UserPlus, DollarSign, LogOut, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/services", label: "Services", icon: Scissors },
    { href: "/admin/points", label: "Points", icon: Coins },
    { href: "/admin/referrals", label: "Referrals", icon: UserPlus },
    { href: "/admin/commissions", label: "Commissions", icon: DollarSign },
  ];

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-background border-r border-border">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.svg" alt="LoyalPro" className="w-8 h-8" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-600">LoyalPro</span>
        <span className="text-xs font-mono text-muted-foreground ml-auto bg-secondary px-2 py-0.5 rounded">ADMIN</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
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
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <img src={user?.imageUrl} alt={user?.fullName || 'Admin'} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.fullName || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => signOut({ redirectUrl: "/" })}>
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
          <span className="text-lg font-semibold">LoyalPro Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}