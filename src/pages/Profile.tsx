import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Phone, Briefcase, Mail, LogOut, Shield, CheckCircle, Edit, X, Save, Building, Star, MessageSquare, ChevronLeft, LocateFixed } from 'lucide-react';
import { Skeleton } from '@/components/UI/skeleton';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/Layout/BottomNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/UI/dialog';
import { Textarea } from '@/components/UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';

const MapPicker = lazy(() => import('@/components/UI/MapPicker'));

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
  service_subcategories: string[];
  location_address: string | null;
  location_coordinates: any;
  email_verified: boolean;
  is_active: boolean;
  rating: number | null;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

const ProfileField = ({ icon, label, value, isEditing, children }: { icon: React.ReactNode, label: string, value: React.ReactNode, isEditing?: boolean, children?: React.ReactNode }) => (
  <div className="flex items-start gap-4 py-4">
    <div className="flex items-center gap-3 text-muted-foreground w-40">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex-1">
      {isEditing ? children : <div className="text-foreground">{value || <span className="text-muted-foreground/80">Not set</span>}</div>}
    </div>
  </div>
);


const ProfilePageSkeleton = () => (
  <div className="container mx-auto px-4 py-12 max-w-6xl">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 py-4">
                <div className="flex items-center gap-3 text-muted-foreground w-40">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Helper to convert [lat, lng] to WKT
function toWKT(coords) {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) return null;
  return `POINT(${coords[1]} ${coords[0]})`;
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | WorkerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changeField, setChangeField] = useState('');
  const [changeValue, setChangeValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [globalChangeModalOpen, setGlobalChangeModalOpen] = useState(false);
  const [globalChangeField, setGlobalChangeField] = useState('');
  const [globalChangeValue, setGlobalChangeValue] = useState('');
  const [globalChangeReason, setGlobalChangeReason] = useState('');
  const [submittingGlobalChange, setSubmittingGlobalChange] = useState(false);
  const [categories, setCategories] = useState<{ category_id: string, category_name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ subcategory_name: string, category_id: string }[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<{ subcategory_name: string }[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const workerFields = [
    { value: 'email', label: 'Email' },
  ];

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: catData, error: catError } = await supabase.from('service_categories').select('category_id, category_name');
      if (catError) console.error('Error fetching categories', catError);
      else setCategories(catData);

      const { data: subcatData, error: subcatError } = await supabase.from('service_subcategories').select('subcategory_name, category_id');
      if (subcatError) console.error('Error fetching subcategories', subcatError);
      else setSubcategories(subcatData);
    };

    fetchCategories();

    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (!navigator.onLine) {
          // Offline: load from localStorage
          const cached = localStorage.getItem('profile');
          if (cached) {
            setProfile(JSON.parse(cached));
            setEditForm(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }
        // Try to fetch from profiles table first
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData as UserProfile);
          setEditForm(profileData);
          localStorage.setItem('profile', JSON.stringify(profileData));
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
            localStorage.setItem('profile', JSON.stringify(workerWithType));
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

  // Effect to filter subcategories when the main category changes
  useEffect(() => {
    if (globalChangeField === 'service_subcategories' && profile && 'service_category' in profile) {
      const currentCategoryName = (profile as WorkerProfile).service_category;
      const currentCategory = categories.find(c => c.category_id === (profile as WorkerProfile).service_category || c.category_name.toLowerCase() === currentCategoryName.toLowerCase());
      console.log('DEBUG: currentCategoryName', currentCategoryName);
      console.log('DEBUG: categories', categories);
      console.log('DEBUG: subcategories', subcategories);
      console.log('DEBUG: currentCategory', currentCategory);
      if (currentCategory) {
        const filteredSubcats = subcategories.filter(sc => sc.category_id === currentCategory.category_id);
        console.log('DEBUG: filteredSubcats', filteredSubcats);
        setFilteredSubcategories(filteredSubcats.map(sc => ({ subcategory_name: sc.subcategory_name })));
      }
    }
  }, [globalChangeField, profile, categories, subcategories]);

  const handleSave = async () => {
    if (!user || !profile) return;

    // Validate location before saving
    if (!editForm.location_address || !editForm.location_coordinates) {
      toast({
        title: "Location Required",
        description: "Please select your location on the map or use your current location.",
        variant: "destructive"
      });
      return;
    }

    try {
      let error;
      const wkt = toWKT(editForm.location_coordinates);
      if ('service_category' in profile) {
        // Worker profile
        const { error: updateError } = await supabase
          .from('workers')
          .update({
            full_name: editForm.full_name,
            mobile_number: editForm.mobile_number,
            business_name: editForm.business_name,
            location_address: editForm.location_address,
            location_coordinates: wkt,
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
            location_coordinates: wkt,
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
      // Notify other tabs/pages to refresh user location
      window.dispatchEvent(new Event('locationUpdated'));
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = async (coords: [number, number]) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
      const data = await response.json();
      const address = data.display_name || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
      setEditForm(prev => ({
        ...prev,
        location_coordinates: coords,
        location_address: address
      }));
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setEditForm(prev => ({
        ...prev,
        location_coordinates: coords,
        location_address: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
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

    setLoading(true);
    toast({ title: "Fetching Location", description: "Please wait..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
          const data = await response.json();
          const address = data.display_name || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
          setEditForm({ ...editForm, location_address: address, location_coordinates: coords });
          toast({
              title: "Location Found",
              description: "Your current location has been set.",
          });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setEditForm({ ...editForm, location_address: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`, location_coordinates: coords });
          toast({
              title: "Location Set",
              description: "Could not fetch address, but coordinates are set.",
              variant: "default"
          })
        } finally {
            setLoading(false);
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
        setLoading(false);
      }
    );
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

  const openChangeModal = (field: string, currentValue: string) => {
    setChangeField(field);
    setChangeValue('');
    setChangeReason('');
    setChangeModalOpen(true);
  };

  const handleChangeRequest = async () => {
    if (!user || !profile) return;
    setSubmittingChange(true);
    const { error } = await supabase.from('change_requests').insert({
      user_id: user.id,
      field: changeField,
      current_value: (profile as any)[changeField] || 'Not set',
      requested_value: changeValue,
      reason: changeReason,
      status: 'pending',
    });
    setSubmittingChange(false);
    if (error) {
      toast({ title: 'Request failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Request Submitted', description: 'Your change request has been sent for review.' });
      setChangeModalOpen(false);
    }
  };

  const handleGlobalChangeRequest = async () => {
    if (!user || !profile || !globalChangeField || !globalChangeValue) {
      toast({ title: 'Missing Information', description: 'Please fill out all fields for the change request.', variant: 'destructive' });
      return;
    }
    setSubmittingGlobalChange(true);
    const { error } = await supabase.from('change_requests').insert({
      user_id: user.id,
      field: globalChangeField,
      current_value: (profile as any)[globalChangeField] || 'Not set',
      requested_value: globalChangeValue,
      reason: globalChangeReason,
      status: 'pending',
    });
    setSubmittingGlobalChange(false);
    if (error) {
      console.error('Change request error:', error);
      toast({ title: 'Request failed', description: `There was an issue submitting your request: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Request Submitted', description: 'Your change request has been sent to the admins for review.' });
      setGlobalChangeModalOpen(false);
      setGlobalChangeField('');
      setGlobalChangeValue('');
      setGlobalChangeReason('');
    }
  };

  if (loading) {
    return <ProfilePageSkeleton />;
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

  const renderProfileDetails = () => (
    <>
      <ProfileField icon={<User size={18} />} label="Full Name" value={profile.full_name} isEditing={isEditing}>
        <Input value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
      </ProfileField>
      <ProfileField icon={<Phone size={18} />} label="Mobile" value={profile.mobile_number} isEditing={isEditing}>
        <Input value={editForm.mobile_number || ''} onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })} />
      </ProfileField>
      <ProfileField icon={<Mail size={18} />} label="Email" value={profile.email}>
        <Button size="sm" variant="outline" onClick={() => openChangeModal('email', profile.email || '')}>Request Change</Button>
      </ProfileField>
      <ProfileField icon={<MapPin size={18} />} label="Location" value={profile.location_address} isEditing={isEditing}>
        <div className="flex flex-col gap-2">
            <p className="text-sm p-3 border rounded-md min-h-[40px]">
                {editForm.location_address || <span className="text-muted-foreground">No address selected</span>}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMapOpen(true)}
                className="flex-grow"
              >
                <MapPin size={16} className="mr-2" />
                Change on Map
              </Button>
               <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleUseCurrentLocation}
                aria-label="Use my current location"
              >
                <LocateFixed size={16} />
              </Button>
            </div>
        </div>
      </ProfileField>
      {isWorker && (
        <>
          <ProfileField icon={<Building size={18} />} label="Business Name" value={(profile as WorkerProfile).business_name} isEditing={isEditing}>
            <Input value={editForm.business_name || ''} onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })} />
          </ProfileField>
          <ProfileField 
            icon={<Briefcase size={18} />} 
            label="Service" 
            value={
              <div>
                <p className="font-semibold">{categories.find(c => c.category_id === editForm.service_category)?.category_name || editForm.service_category}</p>
                <p className="text-sm text-muted-foreground">{ (editForm.service_subcategories?.join(', ') || 'No specializations')}</p>
              </div>
            }
            isEditing={isEditing}
          >
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium">Category</label>
              <select
                value={editForm.service_category || ''}
                onChange={e => {
                  setEditForm(f => ({ ...f, service_category: e.target.value, service_subcategories: [] }));
                }}
                className="border rounded px-2 py-1"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
              <label className="block text-sm font-medium">Subcategories</label>
              <select
                value={editForm.service_subcategories?.[0] || ''}
                onChange={e => setEditForm(f => ({ ...f, service_subcategories: [e.target.value] }))}
                className="border rounded px-2 py-1"
              >
                <option value="">Select Subcategory</option>
                {subcategories.filter(sc => sc.category_id === editForm.service_category).map(sc => (
                  <option key={sc.subcategory_name} value={sc.subcategory_name}>{sc.subcategory_name}</option>
                ))}
              </select>
            </div>
          </ProfileField>
          <ProfileField icon={<Star size={18} />} label="Rating" value={
            <div className="flex items-center gap-2">
                <Badge variant="secondary">{ (profile as WorkerProfile).rating ? (profile as WorkerProfile).rating.toFixed(1) : 'N/A' }</Badge>
                <span className="text-muted-foreground text-sm">from {(profile as WorkerProfile).total_reviews} reviews</span>
            </div>
          }/>
        </>
      )}
    </>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen w-full">
      {isOffline && (
        <div className="bg-yellow-200 text-yellow-900 text-center py-2 font-semibold">
          You are offline. Some features may be unavailable.
        </div>
      )}
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
          <Card className="overflow-hidden shadow-xl rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
            <CardHeader className="items-center text-center p-6 bg-gradient-to-r from-blue-500 to-pink-500 text-white">
              <img
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.full_name || 'User'}`}
                alt="Profile Avatar"
                className="h-24 w-24 rounded-full border-4 border-background shadow-lg mx-auto"
              />
              <CardTitle className="mt-4 text-xl font-extrabold drop-shadow-lg">{profile.full_name || 'User'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1 text-white/90">
                <Mail size={14} /> {profile.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditForm(profile); }}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold shadow-lg" onClick={handleSave} disabled={JSON.stringify(editForm) === JSON.stringify(profile)}>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                )}
              </div>
              {renderProfileDetails()}
            </CardContent>
            <CardFooter className="p-4 border-t">
                <Button 
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full text-destructive-foreground bg-destructive/90 hover:bg-destructive font-bold rounded-lg transition-all duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

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
      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNavigation />
      </div>

      {/* Change Request Modal */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Profile Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium">Field</label>
              <Input value={changeField} disabled />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Value</label>
              <Input value={changeValue} onChange={e => setChangeValue(e.target.value)} placeholder="Enter new value" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Reason (optional)</label>
              <Textarea value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="Why do you want this change?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeRequest} disabled={submittingChange}>{submittingChange ? 'Submitting...' : 'Submit Request'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Change Request Modal */}
      <Dialog open={globalChangeModalOpen} onOpenChange={setGlobalChangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Admin Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium">Field to Change</label>
              <Select value={globalChangeField} onValueChange={field => { setGlobalChangeField(field); setGlobalChangeValue(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {workerFields.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {globalChangeField === 'service_category' ? (
              <div>
                <label className="block mb-1 font-medium">New Category</label>
                <Select value={globalChangeValue} onValueChange={setGlobalChangeValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : globalChangeField === 'service_subcategories' ? (
              <div>
                <label className="block mb-1 font-medium">New Subcategories</label>
                <Select value={globalChangeValue} onValueChange={setGlobalChangeValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map(sc => <SelectItem key={sc.subcategory_name} value={sc.subcategory_name}>{sc.subcategory_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="block mb-1 font-medium">New Value</label>
                <Input value={globalChangeValue} onChange={e => setGlobalChangeValue(e.target.value)} placeholder="Enter new value" />
              </div>
            )}
            
            <div>
              <label className="block mb-1 font-medium">Reason (optional)</label>
              <Textarea value={globalChangeReason} onChange={e => setGlobalChangeReason(e.target.value)} placeholder="Why do you want this change?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGlobalChangeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleGlobalChangeRequest} disabled={submittingGlobalChange}>{submittingGlobalChange ? 'Submitting...' : 'Submit Request'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
