import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api, setAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '', // username or email
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const loginPayload: any = { password: formData.password };
      
      // Determine if identifier is email or username
      if (formData.identifier.includes('@')) {
        loginPayload.email = formData.identifier;
      } else {
        loginPayload.username = formData.identifier;
      }

      const response = await api.post('/admin/login', loginPayload);
      
      // Handle token if returned (fallback for dev)
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      
      toast.success('Login successful');
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 mx-auto">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                type="text"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                placeholder="Enter username or email"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
