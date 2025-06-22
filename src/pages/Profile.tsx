import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import LocationInput from '@/components/UI/LocationInput';
import { UserProfile, UserType } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Phone, Briefcase } from 'lucide-react';

// Mock user data - replace with actual user context/state
const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  mobile: '+1 (555) 123-4567',
  user_type: 'skilled_professional',
  business_name: 'John\'s Plumbing',
  location_address: 'New York, NY',
  location_coordinates: '40.7128,-74.0060',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

// Extended interface for the component's internal state
interface ExtendedUserProfile extends UserProfile {
  category?: string;
  subcategory?: string;
  services?: string[];
  recentSearches?: string[];
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ExtendedUserProfile>({
    ...mockUserProfile,
    category: 'Plumbing',
    subcategory: 'Leak Repair',
    services: ['Leak Repair', 'Pipe Installation'],
    recentSearches: ['Electrician near me', 'House cleaning']
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleLocationSelect = (location: { address: string; coordinates: [number, number] }) => {
    setEditForm(prev => ({
      ...prev,
      location_coordinates: `${location.coordinates[1]},${location.coordinates[0]}`,
      location_address: location.address
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
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
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={editForm.mobile || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{profile.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>{profile.email}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {profile.user_type === 'skilled_professional' && (
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
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory">Specialization</Label>
                  <Input
                    id="subcategory"
                    value={editForm.subcategory || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subcategory: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium">Business: </span>
                  <span>{profile.business_name}</span>
                </div>
                <div>
                  <span className="font-medium">Category: </span>
                  <span>{profile.category}</span>
                </div>
                <div>
                  <span className="font-medium">Specialization: </span>
                  <span>{profile.subcategory}</span>
                </div>
                {profile.services && profile.services.length > 0 && (
                  <div>
                    <span className="font-medium">Services: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
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
        <CardContent>
          {isEditing ? (
            <div>
              <Label>Service Area</Label>
              <LocationInput
                onLocationSelect={handleLocationSelect}
                placeholder={editForm.location_address || "Enter your location..."}
                className="mt-1"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{profile.location_address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.user_type === 'general_user' && profile.recentSearches && profile.recentSearches.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.recentSearches.map((search, index) => (
                <Badge key={index} variant="outline">
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isEditing && (
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setEditForm(profile);
              setIsEditing(false);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
