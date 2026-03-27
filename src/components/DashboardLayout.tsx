import { ReactNode, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logoutUser } from "@/lib/store";
import { Zap, LayoutDashboard, PlusCircle, Wallet, FileText, Brain, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/add-usage", label: "Add Usage", icon: PlusCircle },
  { path: "/ai-predict", label: "AI Predictions", icon: Brain },
  { path: "/budget", label: "Budget Planner", icon: Wallet },
  { path: "/report", label: "History & PDF", icon: FileText },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="gradient-primary shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-primary-foreground text-lg hidden sm:block">Smart Electricity Planner</span>
            <span className="font-bold text-primary-foreground text-lg sm:hidden">SEP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/80 text-sm hidden md:block">
              {user?.name} • {user?.serviceNumber}
            </span>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hidden md:flex" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-4rem)] border-r border-border bg-card p-4 gap-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "gradient-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
            <div className="absolute top-16 left-0 right-0 bg-card border-b border-border p-4 space-y-1 shadow-lg animate-fade-in">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? "gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 mt-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-3" /> Logout
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
