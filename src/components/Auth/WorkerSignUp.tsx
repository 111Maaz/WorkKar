import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building } from 'lucide-react';

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
    address: z.string().min(1, "Location is required."),
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
  { id: 'auto_repair', name: 'Auto Repair', subcategories: ['Two-Wheeler', 'Four-Wheeler', 'Auto / Taxi / Van', 'Truck / Goods Vehicle'] },
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
    
    // Manually check for location as it's a custom component
    const validationResult = formSchema.safeParse(formData);
    if (!validationResult.success || !formData.location) {
        setErrors(validationResult.success === false ? validationResult.error : new z.ZodError([{
            path: ["location"],
            message: "Location is required",
            code: z.ZodIssueCode.custom
        }]));
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
  
  const getError = (field: keyof SignUpData | 'location') => errors?.issues.find(issue => issue.path[0] === field)?.message;

  return (
    <div className="w-full">
      {/* Back button for mobile */}
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
            <div>
              <Label htmlFor="businessName" className="flex items-center gap-2 text-muted-foreground">
                <Building size={16}/>
                Business Name (Optional)
              </Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="e.g., John's Plumbing"
                className="mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-muted-foreground">Service Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({...prev, category: value as SignUpData['category'], subcategory: ''}))}
              >
                <SelectTrigger className={`mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('category') ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a service category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {getError('category') && <p className="text-sm text-red-500 mt-1">{getError('category')}</p>}
            </div>
            {selectedCategory && (
              <div>
                <Label htmlFor="subcategory" className="text-muted-foreground">Specialization *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                >
                  <SelectTrigger className={`mt-1 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/50 ${getError('subcategory') ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select a specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                  </SelectContent>
                </Select>
                {getError('subcategory') && <p className="text-sm text-red-500 mt-1">{getError('subcategory')}</p>}
              </div>
            )}
          </>
        )}

        <div>
          <Label className="flex items-center gap-2 mb-2 text-muted-foreground">
            <MapPin size={16} />
            Location *
          </Label>
          <div 
            className={`mt-1 p-3 border rounded-md cursor-pointer hover:border-primary transition-colors ${getError('location') ? 'border-red-500' : ''}`}
            onClick={() => setIsMapOpen(true)}
          >
            {formData.location ? (
              <span className="text-foreground">{formData.location.address}</span>
            ) : (
              <span className="text-muted-foreground">Click to select location on map</span>
            )}
          </div>
          {getError('location') && <p className="text-sm text-red-500 mt-1">{getError('location')}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full font-bold py-3 text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
          disabled={isSubmitting}
        >
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

      {isMapOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white">Loading Map...</div>}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card p-4 rounded-lg w-full max-w-4xl h-[80vh] relative shadow-2xl">
              <h3 className="text-lg font-medium text-center mb-4">Select Your Location</h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 rounded-full"
                onClick={() => setIsMapOpen(false)}
              >
                <EyeOff className="h-4 w-4" />
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
