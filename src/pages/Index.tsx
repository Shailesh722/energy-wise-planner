import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isOTPVerified } from "@/lib/store";
import { Zap, BarChart3, Shield, FileText, ArrowRight } from "lucide-react";

const features = [
  { icon: Zap, title: "Track Usage", desc: "Log daily meter readings and monitor consumption patterns" },
  { icon: BarChart3, title: "Visual Analytics", desc: "Interactive charts showing daily usage and cost trends" },
  { icon: Shield, title: "Smart Alerts", desc: "Get warned when usage exceeds limits or bills spike" },
  { icon: FileText, title: "PDF Reports", desc: "Download detailed electricity bills anytime" },
];

const Index = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (user && isOTPVerified()) navigate("/dashboard");
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero min-h-[70vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary-foreground" style={{
              width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
              top: `${10 + i * 15}%`, left: `${5 + i * 20}%`, opacity: 0.15 + i * 0.05,
            }} />
          ))}
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/15 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Smart Electricity Monitoring</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-4 leading-tight">
            Smart Electricity<br />Usage Planner
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Track your consumption, reduce bills, get alerts, visualize data, and generate reports — all in one place.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/register")} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg px-8">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Sign In
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("/admin/login")} className="text-primary-foreground hover:bg-primary-foreground/10">
              Admin Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="gradient-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 border border-border/50" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billing Info */}
      <section className="py-16 gradient-light">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">Slab-Based Billing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { range: "0 – 100 units", rate: "Free", color: "bg-primary/10 text-primary" },
              { range: "101 – 200 units", rate: "₹5/unit", color: "bg-warning/10 text-warning" },
              { range: "Above 200 units", rate: "₹7/unit", color: "bg-destructive/10 text-destructive" },
            ].map((slab, i) => (
              <div key={i} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">{slab.range}</p>
                <p className={`text-2xl font-bold ${slab.color} inline-block px-3 py-1 rounded-lg`}>{slab.rate}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-primary py-8 text-center">
        <p className="text-primary-foreground/70 text-sm">© {new Date().getFullYear()} Smart Electricity Usage Planner</p>
      </footer>
    </div>
  );
};

export default Index;
