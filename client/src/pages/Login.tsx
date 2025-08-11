import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

// Admin credentials will be fetched from environment variables
let ADMIN_CREDENTIALS = {
  id: "",
  password: ""
};

const Login = () => {
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch admin credentials from backend on component mount
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await fetch('/api/admin-config');
        if (response.ok) {
          const config = await response.json();
          ADMIN_CREDENTIALS.id = config.adminId;
          ADMIN_CREDENTIALS.password = config.adminPassword;
          setCredentialsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load admin credentials:', error);
        setCredentialsLoaded(true); // Still allow component to render
      }
    };
    
    fetchCredentials();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentialsLoaded) {
      toast({
        title: "Please wait",
        description: "Loading admin configuration...",
      });
      return;
    }

    setIsLoading(true);

    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (formData.id === ADMIN_CREDENTIALS.id && formData.password === ADMIN_CREDENTIALS.password) {
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