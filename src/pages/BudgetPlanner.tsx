import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser, getBudget, setBudget as saveBudget, getTotalUsage, isOTPVerified } from "@/lib/store";
import { Wallet, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BudgetPlanner = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { toast } = useToast();
  const [limit, setLimit] = useState("");
  const [budget, setBudgetState] = useState(getBudget(user?.id || ""));
  const totals = getTotalUsage(user?.id || "");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isOTPVerified()) navigate("/otp");
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const val = parseFloat(limit);
    if (isNaN(val) || val <= 0) {
      toast({ title: "Invalid limit", variant: "destructive" });
      return;
    }
    saveBudget(user.id, val);
    setBudgetState(getBudget(user.id));
    toast({ title: "Budget saved!", description: `Monthly limit set to ${val} units` });
    setLimit("");
  };

  const usagePercent = budget ? Math.min(100, (totals.totalUnits / budget.monthlyLimit) * 100) : 0;
  const exceeded = budget && totals.totalUnits > budget.monthlyLimit;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Set Budget */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Monthly Budget Planner
            </CardTitle>
            <CardDescription>Set a monthly electricity usage limit and track progress</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="limit" className="sr-only">Monthly Limit (units)</Label>
                <Input id="limit" type="number" placeholder="Enter monthly limit in units" value={limit} onChange={e => setLimit(e.target.value)} min="1" required />
              </div>
              <Button type="submit" className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
                <Target className="w-4 h-4 mr-2" /> Set Limit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Budget Status */}
        {budget && (
          <Card className={`shadow-card border-border/50 ${exceeded ? "border-destructive/30" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Budget Status — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usage: <span className="font-semibold text-foreground">{totals.totalUnits} units</span></span>
                <span className="text-muted-foreground">Limit: <span className="font-semibold text-foreground">{budget.monthlyLimit} units</span></span>
              </div>
              <Progress value={usagePercent} className="h-3" />
              <p className="text-sm text-center font-medium">
                {usagePercent.toFixed(1)}% of budget used
              </p>

              {exceeded && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive text-sm">Budget Exceeded!</p>
                    <p className="text-xs text-muted-foreground">
                      You've used {totals.totalUnits - budget.monthlyLimit} units over your limit. Consider reducing consumption.
                    </p>
                  </div>
                </div>
              )}

              {!exceeded && usagePercent >= 80 && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  <p className="text-sm text-warning font-medium">Approaching budget limit! {(100 - usagePercent).toFixed(1)}% remaining.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-xl font-bold text-foreground">{Math.max(0, budget.monthlyLimit - totals.totalUnits)} units</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Current Bill</p>
                  <p className="text-xl font-bold text-primary">₹{totals.totalBill.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BudgetPlanner;
