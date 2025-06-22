import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import LocationInput from '@/components/UI/LocationInput';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const MapPicker = lazy(() => import('@/components/UI/MapPicker'));

type UserType = 'general_user' | 'skilled_professional';

const serviceCategoryEnum = z.enum(['construction', 'plumbing', 'electrical', 'carpentry', 'painting', 'welding', 'home_tutor', 'flooring_tiles', 'false_ceiling', 'tailoring', 'cleaning', 'other']);

const formSchema = z.object({
  userType: z.enum(['general_user', 'skilled_professional']),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  mobile: z.string().min(10, "Please enter a valid mobile number."),
  location: z.object({
    address: z.string(),
    coordinates: z.tuple([z.number(), z.number()])
  }).nullable(),
  category: serviceCategoryEnum.optional(),
  subcategory: z.string().optional(),
  businessName: z.string().optional(),
}).refine(data => {
  if (data.userType === 'skilled_professional') {
    return !!data.category && !!data.subcategory;
  }
  return true;
}, {
  message: "Category and specialization are required for skilled professionals.",
  path: ["category"],
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpData = z.infer<typeof formSchema>;

const categories = [
  { id: 'construction', name: 'Construction', subcategories: ['Masonry', 'Labour', 'Site Supervisor', 'Road Work', 'Cement Finishing'] },
  { id: 'plumbing', name: 'Plumbing', subcategories: ['Leak Repair', 'Bathroom Fittings', 'Tank Cleaning', 'Pipeline Installation'] },
  { id: 'electrical', name: 'Electrical', subcategories: ['Fan Repair', 'Full House Wiring', 'Fuse Fixing', 'Switchboard Setup'] },
  { id: 'carpentry', name: 'Carpentry', subcategories: ['Door Repair', 'Wardrobe Making', 'Window Framing', 'Furniture Assembly'] },
  { id: 'painting', name: 'Painting', subcategories: ['Wall Painting', 'Art Design', 'Exterior Painting', 'Primer Work'] },
  { id: 'welding', name: 'Welding', subcategories: ['Gate Welding', 'Grill Setup', 'Staircase Structure', 'Frame Repair'] },
  { id: 'home_tutor', name: 'Home Tutor', subcategories: ['Primary Level', 'Math', 'Science', 'Language', 'Board Exam Coaching'] },
  { id: 'flooring_tiles', name: 'Flooring / Tiles', subcategories: ['Marble Installation', 'Ceramic Tiles', 'Grouting', 'Polishing'] },
  { id: 'false_ceiling', name: 'False Ceiling', subcategories: ['POP Ceiling', 'Gypsum Design', 'LED Integration', 'Grid Setup'] },
  { id: 'tailoring', name: 'Tailoring', subcategories: ['Blouse Stitching', 'Pants', 'Kids Wear', 'Alteration'] },
  { id: 'cleaning', name: 'Cleaning', subcategories: ['Home Deep Cleaning', 'Sofa Shampooing', 'Bathroom Cleaning', 'Tank Disinfection'] },
  { id: 'other', name: 'Other', subcategories: ['Custom Service'] }
];

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
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  const handleLocationSelect = async (coords: [number, number]) => {
    // Reverse geocode to get address from coordinates
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
      // Fallback to coordinates if API fails
      setFormData(prev => ({
        ...prev,
        location: { address: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`, coordinates: coords }
      }));
    }
    setIsMapOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        subcategory: validData.subcategory,
        businessName: validData.businessName,
        location: validData.location,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account before signing in.",
      });
      
      // Switch to login tab after successful signup
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
  
  const getError = (field: keyof SignUpData) => errors?.issues.find(issue => issue.path[0] === field)?.message;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
        <p className="text-muted-foreground mt-2">Join our community of professionals</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>I am a...</Label>
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
          <Label htmlFor="name" className="flex items-center gap-2">
            <User size={16} />
            Full Name *
          </Label>
          <Input 
            id="name" 
            type="text" 
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name" 
            required 
          />
          {getError('name') && <p className="text-sm text-red-500 mt-1">{getError('name')}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail size={16} />
            Email Address *
          </Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email address" 
            required 
          />
          {getError('email') && <p className="text-sm text-red-500 mt-1">{getError('email')}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock size={16} />
            Password *
          </Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password" 
              className="pr-10"
              required 
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
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock size={16} />
            Confirm Password *
          </Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={formData.confirmPassword || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your password" 
              className="pr-10"
              required 
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
          <Label htmlFor="mobile" className="flex items-center gap-2">
            <Phone size={16} />
            Mobile Number *
          </Label>
          <Input 
            id="mobile" 
            type="tel" 
            value={formData.mobile || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            placeholder="Enter your mobile number" 
            required 
          />
          {getError('mobile') && <p className="text-sm text-red-500 mt-1">{getError('mobile')}</p>}
        </div>

        {formData.userType === 'skilled_professional' && (
          <>
            <div>
              <Label htmlFor="category">Service Category *</Label>
              <Select value={formData.category} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, category: value as z.infer<typeof serviceCategoryEnum>, subcategory: '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError('category') && <p className="text-sm text-red-500 mt-1">{getError('category')}</p>}
            </div>

            {selectedCategory && (
              <div>
                <Label htmlFor="subcategory">Specialization *</Label>
                {formData.category === 'other' ? (
                  <Input
                    id="subcategory"
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="Please specify your service"
                    required
                  />
                ) : (
                  <Select value={formData.subcategory} onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, subcategory: value }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {getError('subcategory') && <p className="text-sm text-red-500 mt-1">{getError('subcategory')}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input 
                id="businessName" 
                type="text" 
                value={formData.businessName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Your business name" 
              />
            </div>
          </>
        )}

        <div>
          <Label className="flex items-center gap-2">
            <MapPin size={16} />
            Your Location *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <Input
              type="text"
              placeholder="City / Address"
              disabled
              value={formData.location?.address || ''}
            />
            <Input
              type="text"
              placeholder="Lat / Lon"
              disabled
              value={formData.location ? `${formData.location.coordinates[0].toFixed(4)}, ${formData.location.coordinates[1].toFixed(4)}` : ''}
            />
          </div>
          <Button type="button" variant="outline" className="w-full mt-2" onClick={() => setIsMapOpen(true)}>
            Pick on Map
          </Button>
          {getError('location') && <p className="text-sm text-red-500 mt-1">{getError('location')}</p>}
        </div>
        
        {isMapOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-2">Select Your Location</h3>
              <Suspense fallback={<div>Loading Map...</div>}>
                <MapPicker onSelect={handleLocationSelect} />
              </Suspense>
              <Button type="button" variant="ghost" className="mt-2" onClick={() => setIsMapOpen(false)}>Close</Button>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => {
              const event = new CustomEvent('switchToLogin');
              window.dispatchEvent(event);
            }}
          >
            Sign in here
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerSignUp;
