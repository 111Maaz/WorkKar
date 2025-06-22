import React, { useState, useEffect } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import LocationInput from '@/components/UI/LocationInput';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Phone, Briefcase, Mail, LogOut, Shield, CheckCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile_number: string | null;
  user_type: 'general_user' | 'skilled_professional';
  business_name: string | null;
  location_address: string | null;
  location_coordinates: any;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkerProfile {
  id: number;
  user_id: string;
  full_name: string;
  email: string | null;
  mobile_number: string;
  business_name: string | null;
  service_category: string;
  service_subcategory: string;
  location_address: string | null;
  location_coordinates: any;
  email_verified: boolean;
  is_active: boolean;
  rating: number | null;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | WorkerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from profiles table first
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData as UserProfile);
          setEditForm(profileData);
        } else {
          // If not in profiles, try workers table
          let { data: workerData, error: workerError } = await supabase
            .from('workers')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (workerData) {
            // Add user_type to worker data for consistency
            const workerWithType = { ...workerData, user_type: 'skilled_professional' as const };
            setProfile(workerWithType as WorkerProfile);
            setEditForm(workerWithType);
          } else {
            toast({
              title: "Profile Not Found",
              description: "Unable to load your profile data.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      let error;
      
      if ('service_category' in profile) {
        // Worker profile
        const { error: updateError } = await supabase
          .from('workers')
          .update({
            full_name: editForm.full_name,
            mobile_number: editForm.mobile_number,
            business_name: editForm.business_name,
            location_address: editForm.location_address,
          })
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // User profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: editForm.full_name,
            mobile_number: editForm.mobile_number,
            location_address: editForm.location_address,
          })
          .eq('id', user.id);
        error = updateError;
      }

      if (error) throw error;

      setProfile(editForm);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = (location: { address: string; coordinates: [number, number] }) => {
    setEditForm(prev => ({
      ...prev,
      location_coordinates: `POINT(${location.coordinates[1]} ${location.coordinates[0]})`,
      location_address: location.address
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your profile.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">Unable to load your profile data.</p>
        </div>
      </div>
    );
  }

  const isWorker = 'service_category' in profile;
  const userType = isWorker ? 'skilled_professional' : profile.user_type;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={editForm.mobile_number || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mobile_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editForm.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">{profile.full_name || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{profile.mobile_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{profile.email}</span>
                {profile.email_verified ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Shield size={16} className="text-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={userType === 'skilled_professional' ? 'default' : 'secondary'}>
                  {userType === 'skilled_professional' ? 'Skilled Professional' : 'General User'}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isWorker && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase size={20} />
              Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={editForm.business_name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, business_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Service Category</Label>
                  <Input
                    id="category"
                    value={editForm.service_category || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Category cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="subcategory">Specialization</Label>
                  <Input
                    id="subcategory"
                    value={editForm.service_subcategory || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Specialization cannot be changed</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium">Business: </span>
                  <span>{profile.business_name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="font-medium">Category: </span>
                  <span>{profile.service_category}</span>
                </div>
                <div>
                  <span className="font-medium">Specialization: </span>
                  <span>{profile.service_subcategory}</span>
                </div>
                {profile.rating !== null && (
                  <div>
                    <span className="font-medium">Rating: </span>
                    <span>{profile.rating}/5 ({profile.total_reviews} reviews)</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div>
              <Label>Location</Label>
              <Input
                value={editForm.location_address || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, location_address: e.target.value }))}
                placeholder="Enter your location"
              />
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => {
                  // TODO: Implement map picker
                  toast({
                    title: "Coming Soon",
                    description: "Map location picker will be available soon.",
                  });
                }}
              >
                Pick on Map
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{profile.location_address || 'Location not set'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
