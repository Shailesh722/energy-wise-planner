import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registerUser } from "@/lib/store";
import { Zap, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [form, setForm] = useState({ serviceNumber: "", name: "", location: "", mobile: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = registerUser({
        serviceNumber: form.serviceNumber,
        name: form.name,
        location: form.location,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
      });
      if (result.success) {
        toast({ title: "Registration successful!", description: "Please login to continue." });
        navigate("/login");
      } else {
        toast({ title: "Registration failed", description: result.message, variant: "destructive" });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen gradient-light flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-lg">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1">Register your electricity service</p>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Registration Form</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="service">Service Number</Label>
                  <Input id="service" placeholder="e.g. SVC-12345" value={form.serviceNumber} onChange={update("serviceNumber")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter name" value={form.name} onChange={update("name")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City / Area" value={form.location} onChange={update("location")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" type="tel" placeholder="10-digit number" value={form.mobile} onChange={update("mobile")} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={update("password")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={update("confirmPassword")} required />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90 mt-2" disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
