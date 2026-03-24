import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginAdmin, resetAdminCredentials } from "@/lib/store";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    resetAdminCredentials();
    setUsername("admin");
    setPassword("admin123");
    toast({ title: "Admin credentials reset", description: "Username: admin / Password: admin123" });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const result = loginAdmin(username.trim(), password);
      if (result.success) {
        toast({ title: "Admin login successful" });
        navigate("/admin/dashboard");
      } else {
        toast({ title: "Admin login failed", description: result.message, variant: "destructive" });
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen gradient-light flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-card border-border/50">
          <CardHeader className="text-center">
            <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl gradient-primary mx-auto mb-2">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Separate admin access portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input id="admin-username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter admin username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" required />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90" disabled={loading}>
                {loading ? "Signing in..." : "Sign in as Admin"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleReset}>
                Reset Admin Credentials
              </Button>
              <p className="text-xs text-muted-foreground text-center">Default demo admin: <span className="font-medium">admin / admin123</span></p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;