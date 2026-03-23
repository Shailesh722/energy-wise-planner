import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentUser, generateOTP, verifyOTP } from "@/lib/store";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OTPVerify = () => {
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const code = generateOTP();
    setGeneratedOTP(code);
    toast({ title: "OTP Generated", description: `Your OTP is: ${code} (shown here since email is not configured)` });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOTP(otp)) {
      toast({ title: "OTP Verified!", description: "Welcome to your dashboard." });
      navigate("/dashboard");
    } else {
      toast({ title: "Invalid OTP", description: timeLeft <= 0 ? "OTP expired. Please resend." : "Please check and try again.", variant: "destructive" });
    }
  };

  const handleResend = () => {
    const code = generateOTP();
    setGeneratedOTP(code);
    setTimeLeft(300);
    setOtp("");
    toast({ title: "OTP Resent", description: `New OTP: ${code}` });
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="min-h-screen gradient-light flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-card border-border/50">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <CardTitle>OTP Verification</CardTitle>
            <CardDescription>Enter the 6-digit code to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show OTP for demo since no email service */}
            <div className="bg-accent/60 rounded-lg p-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Demo OTP (normally sent via email)</p>
              <p className="text-2xl font-bold tracking-[0.3em] text-primary">{generatedOTP}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
              <div className="text-center text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <span>Expires in <span className="font-medium text-foreground">{mins}:{secs.toString().padStart(2, '0')}</span></span>
                ) : (
                  <span className="text-destructive">OTP expired</span>
                )}
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90" disabled={otp.length !== 6}>
                Verify OTP
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleResend}>
                <RefreshCw className="w-4 h-4 mr-2" /> Resend OTP
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerify;
