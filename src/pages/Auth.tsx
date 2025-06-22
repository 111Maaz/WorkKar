import React, { useState } from 'react';
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

type UserType = 'skilled_professional' | 'general_user';
type ServiceCategory = 'construction' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'cleaning' | 'other';

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
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-2 sm:p-4">
      <div className="w-full max-w-lg">
        <WorkerSignUp />
      </div>
    </div>
  );
};

export default Auth;
