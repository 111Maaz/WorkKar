export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  category: string;
  rating: number;
  numReviews: number;
  hourlyRate: number;
  location: GeoPoint;
  location_address?: string; // Full address string
  distance?: number; // Optional, calculated based on user location
  tags: string[];
  bio: string;
  availability: boolean;
  joined: string; // ISO date string
  mobile: string; // New field for mobile number
  businessName?: string; // Optional business name
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories?: string[]; // Added subcategories
}

export interface Review {
  id: string;
  workerId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string; // ISO date string
}

export type UserType = 'skilled_professional' | 'general_user';
export type ServiceCategory = 'construction' | 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'welding' | 'home_tutor' | 'flooring_tiles' | 'false_ceiling' | 'tailoring' | 'cleaning' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  user_type: UserType;
  location_address?: string;
  location_coordinates?: string;
  business_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalService {
  id: string;
  user_id: string;
  category: ServiceCategory;
  custom_category?: string;
  subcategories: string[];
  created_at: string;
  updated_at: string;
}
