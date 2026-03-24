import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { getAlerts, getAvailableMonths, getCurrentMonth, getCurrentUser, getTotalUsage, getUsageRecords, isOTPVerified } from "@/lib/store";
import { Zap, IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [availableMonths, setAvailableMonths] = useState<string[]>([getCurrentMonth()]);
  const [records, setRecords] = useState(getUsageRecords(user?.id || "", getCurrentMonth()));
  const [totals, setTotals] = useState(getTotalUsage(user?.id || "", getCurrentMonth()));
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isOTPVerified()) { navigate("/otp"); return; }
    const months = getAvailableMonths(user.id);
    setAvailableMonths(months);
    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setRecords(getUsageRecords(user.id, selectedMonth));
    setTotals(getTotalUsage(user.id, selectedMonth));
    setAlerts(getAlerts(user.id, selectedMonth));
  }, [selectedMonth, user]);

  const formatMonth = (month: string) => new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const chartData = [...records].reverse().slice(-14).map(r => ({
    date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    units: r.dailyUsage,
    amount: r.amount,
  }));

  const statCards = [
    { title: "Total Units", value: totals.totalUnits.toLocaleString(), icon: Zap, color: "text-primary" },
    { title: "Total Bill", value: `₹${totals.totalBill.toLocaleString()}`, icon: IndianRupee, color: "text-warning" },
    { title: "Records", value: records.length.toString(), icon: TrendingUp, color: "text-info" },
    { title: "Alerts", value: alerts.length.toString(), icon: AlertTriangle, color: alerts.length > 0 ? "text-destructive" : "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground text-sm">Overview for {formatMonth(selectedMonth)}</p>
          </div>
          <div className="space-y-1">
            <label htmlFor="month-select" className="text-xs font-medium text-muted-foreground">Select Month (History)</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonth(month)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm font-medium">
                {alert}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="shadow-card border-border/50 hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Usage (Units) — {formatMonth(selectedMonth)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 20%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(160, 10%, 45%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(160, 10%, 45%)" />
                    <Tooltip />
                    <Area type="monotone" dataKey="units" stroke="hsl(152, 60%, 42%)" fill="url(#colorUnits)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Cost (₹) — {formatMonth(selectedMonth)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 20%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(160, 10%, 45%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(160, 10%, 45%)" />
                    <Tooltip />
                    <Bar dataKey="amount" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Records */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Readings</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No readings yet. Add your first meter reading!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Reading</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Units</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 10).map(r => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-2.5">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                        <td className="text-right">{r.meterReading}</td>
                        <td className="text-right font-medium">{r.dailyUsage}</td>
                        <td className="text-right font-medium text-primary">₹{r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
