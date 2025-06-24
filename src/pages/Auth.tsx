import React, { useState, useEffect } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Checkbox } from '@/components/UI/checkbox';
import LocationInput from '@/components/UI/LocationInput';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WorkerSignUp from '@/components/Auth/WorkerSignUp';
import Login from '@/components/Auth/Login';

type UserType = 'skilled_professional' | 'general_user';
type ServiceCategory = 'construction' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'cleaning' | 'auto_repair' | 'other';

interface SignUpData {
  password: string;
  userType: UserType;
  name: string;
  mobile: string;
  category?: ServiceCategory;
  customCategory?: string;
  subcategories: string[];
  businessName: string;
  location: {
    address: string;
    coordinates: [number, number];
  } | null;
}

interface SignInData {
  mobile: string;
  password: string;
}

const categories = [
  { id: 'construction', name: 'Construction' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'painting', name: 'Painting' },
  { id: 'welding', name: 'Welding' },
  { id: 'home_tutor', name: 'Home Tutor' },
  { id: 'flooring_tiles', name: 'Flooring / Tiles' },
  { id: 'false_ceiling', name: 'False Ceiling' },
  { id: 'tailoring', name: 'Tailoring' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'auto_repair', name: 'Auto Repair' },
  { id: 'other', name: 'Other' }
];

const subcategoryMappings: Record<ServiceCategory, string[]> = {
  construction: ['Masonry', 'Labour', 'Site Supervisor', 'Road Work', 'Cement Finishing'],
  plumbing: ['Leak Repair', 'Bathroom Fittings', 'Tank Cleaning', 'Pipeline Installation'],
  electrical: ['Fan Repair', 'Full House Wiring', 'Fuse Fixing', 'Switchboard Setup'],
  carpentry: ['Door Repair', 'Wardrobe Making', 'Window Framing', 'Furniture Assembly'],
  painting: ['Wall Painting', 'Art Design', 'Exterior Painting', 'Primer Work'],
  welding: ['Gate Welding', 'Grill Setup', 'Staircase Structure', 'Frame Repair'],
  home_tutor: ['Primary Level', 'Math', 'Science', 'Language', 'Board Exam Coaching'],
  flooring_tiles: ['Marble Installation', 'Ceramic Tiles', 'Grouting', 'Polishing'],
  false_ceiling: ['POP Ceiling', 'Gypsum Design', 'LED Integration', 'Grid Setup'],
  tailoring: ['Blouse Stitching', 'Pants', 'Kids Wear', 'Alteration'],
  cleaning: ['Home Deep Cleaning', 'Sofa Shampooing', 'Bathroom Cleaning', 'Tank Disinfection'],
  auto_repair: ['Two-Wheeler', 'Four-Wheeler', 'Auto / Taxi / Van', 'Truck / Goods Vehicle'],
  other: []
};

const hardcodedUsers = [
  {
    mobile: '9999999999',
    password: 'password123',
    name: 'John Doe',
    userType: 'skilled_professional',
    businessName: 'John Plumbing',
    category: 'plumbing',
    subcategories: ['Leak Repair', 'Tank Cleaning'],
    location: { address: 'Hyderabad', coordinates: [78.4867, 17.3850] }
  },
  {
    mobile: '8888888888',
    password: 'testpass',
    name: 'Jane Smith',
    userType: 'general_user',
    businessName: '',
    category: '',
    subcategories: [],
    location: { address: 'Secunderabad', coordinates: [78.4983, 17.4399] }
  }
];

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    const handleSwitchToLogin = () => setActiveTab('login');
    const handleSwitchToSignup = () => setActiveTab('signup');

    window.addEventListener('switchToLogin', handleSwitchToLogin);
    window.addEventListener('switchToSignup', handleSwitchToSignup);

    return () => {
      window.removeEventListener('switchToLogin', handleSwitchToLogin);
      window.removeEventListener('switchToSignup', handleSwitchToSignup);
    };
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center animated-gradient p-4">
      {/* Back button for mobile */}
      <div className="md:hidden px-4 pt-4 absolute left-0 top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Button>
      </div>
      <div className="w-full max-w-4xl flex bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Left decorative panel */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-primary/10 p-12 text-center text-primary-foreground">
          <img src="/WorkKar icon.png" alt="WorkKar Logo" className="w-24 h-24 mb-6 rounded-full shadow-lg"/>
          <h1 className="text-3xl font-bold text-foreground">Welcome to WorkKar</h1>
          <p className="mt-4 text-muted-foreground">
            Connecting you with the best local professionals for any job, big or small.
          </p>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <Login />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <WorkerSignUp />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
