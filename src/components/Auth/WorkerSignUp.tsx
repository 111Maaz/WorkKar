import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building, X, LocateFixed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/UI/checkbox';

const MapPicker = lazy(() => import('@/components/UI/MapPicker'));

type UserType = 'general_user' | 'skilled_professional';

const formSchema = z.object({
  userType: z.enum(['general_user', 'skilled_professional']),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  mobile: z.string().min(10, "Please enter a valid mobile number."),
  location: z.object({
    address: z.string().min(1, "Location is required."),
    coordinates: z.tuple([z.number(), z.number()])
  }).nullable(),
  category: z.string().optional(),
  subcategories: z.array(z.string()).optional(),
  businessName: z.string().optional(),
}).refine(data => {
  if (data.userType === 'skilled_professional') {
    return !!data.category && data.subcategories && data.subcategories.length > 0;
  }
  return true;
}, {
  message: "Category and at least one specialization are required for skilled professionals.",
  path: ["category"],
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpData = z.infer<typeof formSchema>;

interface CategoryFromDB {
  category_id: string;
  category_name: string;
}

interface SubcategoryFromDB {
  subcategory_name: string;
  category_id: string;
}

// Helper to convert [lat, lng] to WKT
function toWKT(coords) {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) return null;
  return `POINT(${coords[1]} ${coords[0]})`;
}

const WorkerSignUp: React.FC = () => {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<Partial<SignUpData>>({
    userType: 'general_user',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    location: null,
    subcategories: [],
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [categories, setCategories] = useState<CategoryFromDB[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryFromDB[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<SubcategoryFromDB[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from('service_categories').select('category_id, category_name').eq('is_active', true);
      const { data: subcatData } = await supabase.from('service_subcategories').select('subcategory_name, category_id').eq('is_active', true);
      setCategories(catData || []);
      setSubcategories(subcatData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.category) {
      const filtered = subcategories.filter(sc => sc.category_id === formData.category);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category, subcategories]);

  const handleLocationSelect = async (coords: [number, number]) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
      const data = await response.json();
      const address = data.display_name || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
      
      setFormData(prev => ({
        ...prev,
        location: { address, coordinates: coords }
      }));
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setFormData(prev => ({
        ...prev,
        location: { address: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`, coordinates: coords }
      }));
    }
    setIsMapOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    toast({ title: "Fetching Location", description: "Please wait..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
          const data = await response.json();
          const address = data.display_name || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
          
          setFormData(prev => ({
            ...prev,
            location: { address, coordinates: coords }
          }));
          toast({
              title: "Location Found",
              description: "Your current location has been set.",
          });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setFormData(prev => ({
            ...prev,
            location: { address: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`, coordinates: coords }
          }));
          toast({
              title: "Location Set",
              description: "Could not fetch address, but coordinates are set.",
              variant: "default"
          })
        } finally {
            setIsSubmitting(false);
        }
      },
      (error) => {
        let message = 'Unable to get your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow location access in your browser settings.';
        }
        toast({
          title: "Geolocation Error",
          description: message,
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location || !formData.location.address || !formData.location.coordinates) {
      setErrors(new z.ZodError([{
        path: ["location"],
        message: "Location (address and coordinates) is required",
        code: z.ZodIssueCode.custom
      }]));
      toast({
        title: "Missing Information",
        description: "Please select your location on the map or use your current location.",
        variant: "destructive"
      });
      return;
    }
    const validationResult = formSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error);
      toast({
        title: "Missing Information",
        description: "Please correct the errors below.",
        variant: "destructive"
      });
      return;
    }

    setErrors(null);
    setIsSubmitting(true);
    const { data: validData } = validationResult;

    try {
      const { error } = await signUp(validData.email, validData.password, {
        name: validData.name,
        mobile: validData.mobile,
        userType: validData.userType,
        category: validData.category,
        subcategories: validData.subcategories,
        businessName: validData.businessName,
        location_address: validData.location.address,
        location_coordinates: toWKT(validData.location.coordinates),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account before signing in.",
      });
      
      setTimeout(() => {
        const event = new CustomEvent('switchToLogin');
        window.dispatchEvent(event);
      }, 2000);

    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getError = (field: keyof SignUpData | 'location') => errors?.issues.find(issue => issue.path[0] === field)?.message;

  const handleSubcategoryChange = (subcategoryName: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentSubs = prev.subcategories || [];
      if (isChecked) {
        return { ...prev, subcategories: [...currentSubs, subcategoryName] };
      } else {
        return { ...prev, subcategories: currentSubs.filter(s => s !== subcategoryName) };
      }
    });
  };

  const handleSelectAllSubcategories = (isChecked: boolean) => {
    if (isChecked) {
      setFormData(prev => ({ ...prev, subcategories: filteredSubcategories.map(s => s.subcategory_name) }));
    } else {
      setFormData(prev => ({ ...prev, subcategories: [] }));
    }
  };

  return (
    <div className="w-full">
      <div className="md:hidden px-4 pt-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Button>
      </div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create Your Account</h2>
        <p className="text-muted-foreground mt-1">Join our community of professionals.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-muted-foreground">I am a...</Label>
          <RadioGroup 
            defaultValue="general_user" 
            className="flex gap-4 mt-2"
            onValueChange={(value: UserType) => setFormData(prev => ({...prev, userType: value}))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="general_user" id="r1" />
              <Label htmlFor="r1">General User</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="skilled_professional" id="r2" />
              <Label htmlFor="r2">Skilled Professional</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground">
            <User size={16} />
            Full Name *
          </Label>
          <Input 
            id="name" 
            type="text" 
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name" 
            className={`mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('name') ? 'border-red-500' : ''}`}
          />
          {getError('name') && <p className="text-sm text-red-500 mt-1">{getError('name')}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
            <Mail size={16} />
            Email Address *
          </Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com" 
            className={`mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('email') ? 'border-red-500' : ''}`}
          />
          {getError('email') && <p className="text-sm text-red-500 mt-1">{getError('email')}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="flex items-center gap-2 text-muted-foreground">
            <Lock size={16} />
            Password *
          </Label>
          <div className="relative mt-1">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password (min. 6 characters)" 
              className={`pr-10 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('password') ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {getError('password') && <p className="text-sm text-red-500 mt-1">{getError('password')}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-muted-foreground">
            <Lock size={16} />
            Confirm Password *
          </Label>
          <div className="relative mt-1">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={formData.confirmPassword || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your password" 
              className={`pr-10 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('confirmPassword') ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {getError('confirmPassword') && <p className="text-sm text-red-500 mt-1">{getError('confirmPassword')}</p>}
        </div>
        
        <div>
          <Label htmlFor="mobile" className="flex items-center gap-2 text-muted-foreground">
            <Phone size={16} />
            Mobile Number *
          </Label>
          <Input 
            id="mobile" 
            type="tel" 
            value={formData.mobile || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            placeholder="Enter your 10-digit mobile number" 
            className={`mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('mobile') ? 'border-red-500' : ''}`}
          />
          {getError('mobile') && <p className="text-sm text-red-500 mt-1">{getError('mobile')}</p>}
        </div>

        {formData.userType === 'skilled_professional' && (
          <>
            <div className="animate-fade-in">
              <Label htmlFor="category" className="text-muted-foreground">Service Category *</Label>
              <Select
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategories: [] }))}
                value={formData.category}
              >
                <SelectTrigger id="category" className={`mt-1 transition-all duration-300 ${getError('category') ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>{cat.category_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredSubcategories.length > 0 && (
              <div className="animate-fade-in space-y-3">
                <Label className="text-muted-foreground">Specializations (Select all that apply)</Label>
                <div className="p-3 border rounded-md max-h-48 overflow-y-auto space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      onCheckedChange={handleSelectAllSubcategories}
                      checked={!!formData.subcategories && formData.subcategories.length === filteredSubcategories.length && filteredSubcategories.length > 0}
                    />
                    <Label htmlFor="select-all" className="font-semibold">Select All</Label>
                  </div>
                  {filteredSubcategories.map(sub => (
                    <div key={sub.subcategory_name} className="flex items-center space-x-2">
                      <Checkbox
                        id={sub.subcategory_name}
                        onCheckedChange={(checked) => handleSubcategoryChange(sub.subcategory_name, !!checked)}
                        checked={formData.subcategories?.includes(sub.subcategory_name)}
                      />
                      <Label htmlFor={sub.subcategory_name}>{sub.subcategory_name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="animate-fade-in">
              <Label htmlFor="businessName" className="flex items-center gap-2 text-muted-foreground">
                <Building size={16} />
                Business Name (Optional)
              </Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="e.g., JD Electricals"
                className="mt-1"
              />
            </div>
          </>
        )}
        
        <div>
          <Label htmlFor="location" className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={16} />
            Location *
          </Label>
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsMapOpen(true)}
                className="flex-grow"
                disabled={isSubmitting}
              >
                <MapPin size={16} className="mr-2" /> Pick on Map
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleUseCurrentLocation}
                disabled={isSubmitting}
                aria-label="Use my current location"
              >
                <LocateFixed size={16} />
              </Button>
            </div>
            {formData.location?.address && (
              <p className="text-sm text-muted-foreground mt-2 truncate" title={formData.location.address}>
                Selected: {formData.location.address}
              </p>
            )}
          </div>
          {getError('location') && <p className="text-sm text-red-500 mt-1">{getError('location')}</p>}
        </div>
        
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </div>
      </form>
      
      {isMapOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white">Loading Map...</div>}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-card p-4 rounded-lg w-full max-w-4xl h-[80vh] relative shadow-2xl">
              <h3 className="text-lg font-medium text-center mb-4">Select Your Location</h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 rounded-full"
                onClick={() => setIsMapOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <MapPicker onSelect={handleLocationSelect} />
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
};

export default WorkerSignUp;
