import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});

  const validateForm = () => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors below.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "You have been successfully logged in.",
        });
        // Redirect to home page after successful login
        setTimeout(() => window.location.href = '/', 1000);
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground mt-1">Sign in to continue your journey.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
            <Mail size={16} />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            className={`mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${errors.email ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="flex items-center gap-2 text-muted-foreground">
            <Lock size={16} />
            Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              className={`pr-10 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${errors.password ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "Password reset functionality will be available soon.",
              });
            }}
          >
            Forgot your password?
          </button>
        </div>

        <Button 
          type="submit" 
          className="w-full font-bold py-3 text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => {
              const event = new CustomEvent('switchToSignup');
              window.dispatchEvent(event);
            }}
          >
            Sign up here
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login; 