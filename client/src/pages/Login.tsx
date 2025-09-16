import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

// Removed global credential storage for security - now using server-side authentication

const Login = () => {
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loginReady, setLoginReady] = useState(true);
  const [, setLocation] = useLocation();

  // No longer fetching credentials to memory - using secure server-side authentication

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginReady) {
      toast({
        title: "Please wait",
        description: "System initializing...",
      });
      return;
    }

    setIsLoading(true);

    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Secure server-side authentication
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: formData.id,
          adminPassword: formData.password
        })
      });
      
      if (response.ok) {
        localStorage.setItem("moviezone_admin_logged_in", "true");
        toast({
          title: "Login Successful",
          description: "Welcome to MovieZone Admin Panel",
        });
        setLocation("/admin");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            MovieZone Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">Admin ID</Label>
              <Input
                id="id"
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="Enter admin ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;