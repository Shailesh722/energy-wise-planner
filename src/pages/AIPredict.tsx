import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser, getUsageRecords, getAvailableMonths, getCurrentMonth, getTotalUsage, isOTPVerified, calculateBill } from "@/lib/store";
import { Brain, TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AIPredict = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [predictions, setPredictions] = useState<{
    nextMonthUnits: number;
    nextMonthBill: number;
    avgDaily: number;
    trend: "up" | "down" | "stable";
    trendPercent: number;
    weeklyForecast: { day: string; predicted: number }[];
    tips: string[];
    confidence: number;
  } | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isOTPVerified()) { navigate("/otp"); return; }
    generatePredictions();
  }, []);

  const generatePredictions = () => {
    if (!user) return;
    const months = getAvailableMonths(user.id);
    const currentMonth = getCurrentMonth();
    const currentRecords = getUsageRecords(user.id, currentMonth);
    const currentTotals = getTotalUsage(user.id, currentMonth);

    // Collect historical data
    const monthlyData: { month: string; totalUnits: number }[] = [];
    for (const m of months) {
      const t = getTotalUsage(user.id, m);
      monthlyData.push({ month: m, totalUnits: t.totalUnits });
    }

    // Calculate averages
    const dailyUsages = currentRecords.map(r => r.dailyUsage);
    const avgDaily = dailyUsages.length > 0
      ? dailyUsages.reduce((s, v) => s + v, 0) / dailyUsages.length
      : 5; // default estimate

    // Trend analysis
    let trend: "up" | "down" | "stable" = "stable";
    let trendPercent = 0;
    if (dailyUsages.length >= 4) {
      const firstHalf = dailyUsages.slice(0, Math.floor(dailyUsages.length / 2));
      const secondHalf = dailyUsages.slice(Math.floor(dailyUsages.length / 2));
      const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
      if (avgFirst > 0) {
        trendPercent = ((avgSecond - avgFirst) / avgFirst) * 100;
        trend = trendPercent > 5 ? "up" : trendPercent < -5 ? "down" : "stable";
      }
    }

    // Predict next month (30 days * avg daily with trend adjustment)
    const trendMultiplier = 1 + (trendPercent / 100) * 0.5;
    const predictedDaily = avgDaily * trendMultiplier;
    const nextMonthUnits = Math.round(predictedDaily * 30);
    const nextMonthBill = calculateBill(nextMonthUnits);

    // 7-day forecast with slight variation
    const weeklyForecast = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const variation = 0.8 + Math.random() * 0.4; // ±20% variation
      weeklyForecast.push({
        day: d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit" }),
        predicted: Math.round(predictedDaily * variation * 10) / 10,
      });
    }

    // Smart tips based on usage patterns
    const tips: string[] = [];
    if (avgDaily > 8) tips.push("🔌 Your daily usage is high. Consider switching to energy-efficient appliances.");
    if (avgDaily > 6) tips.push("❄️ AC usage might be high. Set temperature to 24°C for optimal savings.");
    if (trend === "up") tips.push("📈 Your usage is trending upward. Review your consumption patterns.");
    if (nextMonthBill > 1000) tips.push("💰 Predicted bill exceeds ₹1000. Consider reducing peak-hour usage.");
    tips.push("💡 Switch off lights and fans when leaving rooms to save 10-15% electricity.");
    tips.push("🌡️ Use natural ventilation during cool hours instead of AC.");
    if (currentTotals.totalUnits > 150) tips.push("⚡ You're approaching the ₹7/unit slab. Try to keep usage under 200 units.");

    // Confidence based on data availability
    const confidence = Math.min(95, 40 + currentRecords.length * 5);

    setPredictions({
      nextMonthUnits,
      nextMonthBill,
      avgDaily: Math.round(avgDaily * 10) / 10,
      trend,
      trendPercent: Math.round(Math.abs(trendPercent) * 10) / 10,
      weeklyForecast,
      tips: tips.slice(0, 5),
      confidence,
    });
  };

  const TrendIcon = predictions?.trend === "up" ? TrendingUp : predictions?.trend === "down" ? TrendingDown : Minus;
  const trendColor = predictions?.trend === "up" ? "text-destructive" : predictions?.trend === "down" ? "text-primary" : "text-muted-foreground";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Usage Predictions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Smart predictions based on your consumption patterns
          </p>
        </div>

        {predictions ? (
          <>
            {/* Prediction Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Predicted Next Month</p>
                  <p className="text-2xl font-bold text-foreground">{predictions.nextMonthUnits} units</p>
                  <p className="text-xs text-primary">≈ ₹{predictions.nextMonthBill.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Avg Daily Usage</p>
                  <p className="text-2xl font-bold text-foreground">{predictions.avgDaily} units</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Usage Trend</p>
                  <div className="flex items-center gap-2">
                    <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                    <span className={`text-lg font-bold ${trendColor}`}>
                      {predictions.trend === "stable" ? "Stable" : `${predictions.trendPercent}%`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{predictions.trend}</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                  <p className="text-2xl font-bold text-primary">{predictions.confidence}%</p>
                  <p className="text-xs text-muted-foreground">Based on {getUsageRecords(user?.id || "", getCurrentMonth()).length} records</p>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Forecast Chart */}
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">7-Day Usage Forecast</CardTitle>
                <CardDescription>AI-predicted daily usage for the upcoming week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={predictions.weeklyForecast}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(210, 70%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(210, 70%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 45%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 45%)" />
                    <Tooltip />
                    <Area type="monotone" dataKey="predicted" stroke="hsl(210, 70%, 50%)" fill="url(#colorPredicted)" strokeWidth={2} name="Predicted (units)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Smart Tips */}
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  AI Energy Saving Tips
                </CardTitle>
                <CardDescription>Personalized recommendations based on your usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.tips.map((tip, i) => (
                    <div key={i} className="bg-accent/40 rounded-lg p-3 text-sm text-foreground">
                      {tip}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-card border-border/50">
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <p className="text-muted-foreground">Analyzing your consumption patterns...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIPredict;
