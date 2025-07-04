import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import Hero from '@/components/Home/Hero';
import CategorySelector from '@/components/Home/CategorySelector';
import WorkerList from '@/components/Workers/WorkerList';
import BottomNavigation from '@/components/Layout/BottomNavigation';
import { Worker } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [sortBy, setSortBy] = useState<string>('distance'); // default sort by distance

  // Haversine formula for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if ([lat1, lon1, lat2, lon2].some(coord => typeof coord !== 'number')) return undefined;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Listen for online/offline events
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

  // 1. Fetch workers and calculate distances based on user's location
  const fetchAndProcessWorkers = useCallback(async (userLocation: { latitude: number, longitude: number } | null) => {
    setLoading(true);
    try {
      if (!navigator.onLine) {
        // Offline: load from localStorage
        const cached = localStorage.getItem('workers');
        if (cached) {
          const parsed = JSON.parse(cached);
          setWorkers(parsed);
          setFilteredWorkers(parsed);
          setLoading(false);
          return;
        }
      }
      const { data, error } = await supabase
        .from('workers_with_geojson')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data
      let transformedWorkers: Worker[] = data.map((worker: any) => {
        try {
          let latitude: number | undefined;
          let longitude: number | undefined;
          
          if (worker.location_coordinates_geojson && Array.isArray(worker.location_coordinates_geojson.coordinates)) {
            longitude = worker.location_coordinates_geojson.coordinates[0];
            latitude = worker.location_coordinates_geojson.coordinates[1];
          }

          const distance = (userLocation && typeof latitude === 'number' && typeof longitude === 'number')
            ? calculateDistance(userLocation.latitude, userLocation.longitude, latitude, longitude)
            : undefined;

          return {
            id: worker.id.toString(),
            user_id: worker.user_id,
            name: worker.full_name,
            avatar: '/placeholder.svg',
            profession: worker.service_category,
            category: worker.service_category,
            rating: worker.rating || 0,
            numReviews: worker.total_reviews || 0,
            hourlyRate: 0,
            location: { latitude: latitude || 0, longitude: longitude || 0 },
            location_address: worker.location_address,
            distance: distance,
            tags: worker.service_subcategories || [],
            bio: '', availability: true,
            joined: new Date(worker.created_at).toLocaleDateString(),
            mobile: worker.mobile_number,
            businessName: worker.business_name || '',
            verification_status: worker.verification_status || undefined,
          };
        } catch (e) {
          console.error('Failed to process a worker record:', worker, e);
          return null;
        }
      }).filter(Boolean) as Worker[];

      // Sort by distance if available
      if (userLocation) {
        transformedWorkers.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }

      setWorkers(transformedWorkers);
      setFilteredWorkers(transformedWorkers);
      // Cache to localStorage
      localStorage.setItem('workers', JSON.stringify(transformedWorkers));

      const categoryMap = new Map<string, string>();
      transformedWorkers.forEach(worker => {
        if (worker.category) {
          const normalizedCategory = worker.category.toLowerCase().trim();
          if (!categoryMap.has(normalizedCategory)) {
            // Capitalize the first letter for consistent display
            const displayName = worker.category.charAt(0).toUpperCase() + worker.category.slice(1).toLowerCase();
            categoryMap.set(normalizedCategory, displayName);
          }
        }
      });
      const uniqueCategories = Array.from(categoryMap.values());
      setCategories(uniqueCategories);

    } catch (error: any) {
      console.error('Error fetching workers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const initializePage = useCallback(async () => {
    let fetchedUserLocation: { latitude: number, longitude: number } | null = null;

    if (user) {
      // 1. Try to fetch from profile (Supabase)
      let locationData = null;
      try {
        let { data: worker, error: workerError } = await supabase
          .from('workers_with_geojson')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (worker && worker.location_coordinates_geojson && Array.isArray(worker.location_coordinates_geojson.coordinates)) {
          locationData = {
            longitude: worker.location_coordinates_geojson.coordinates[0],
            latitude: worker.location_coordinates_geojson.coordinates[1]
          };
        } else {
          const { data: profile, error: profileError } = await supabase
            .from('profiles_with_geojson')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profile && profile.location_coordinates_geojson && Array.isArray(profile.location_coordinates_geojson.coordinates)) {
            locationData = {
              longitude: profile.location_coordinates_geojson.coordinates[0],
              latitude: profile.location_coordinates_geojson.coordinates[1]
            };
          }
        }
      } catch (e) {
        console.log('Error fetching profile location:', e);
      }
      if (locationData) {
        console.log('Using profile location:', locationData);
        fetchedUserLocation = locationData;
      } else {
        console.log('No profile location found, will try browser/device location');
      }
    }

    // 2. Only if profile location is missing, use device location
    if (!fetchedUserLocation && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        fetchedUserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log('Using browser/device location:', fetchedUserLocation);
      } catch (err) {
        console.warn('Could not get browser/device location:', err);
      }
    }

    setUserLocation(fetchedUserLocation);
    await fetchAndProcessWorkers(fetchedUserLocation);
  }, [fetchAndProcessWorkers, user]);

  // 2. On component mount, determine user location then fetch workers
  useEffect(() => {
    initializePage();
  }, [initializePage]);

  // Handle search functionality
  const handleSearch = (query: string, location: string) => {
    const queryLower = query.trim().toLowerCase();
    const locationLower = location.trim().toLowerCase();

    let filtered = workers;

    // Filter by service/professional query if it exists
    if (queryLower) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(queryLower) ||
        worker.profession.toLowerCase().includes(queryLower) ||
        worker.category.toLowerCase().includes(queryLower) ||
        worker.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    // Filter by location query if it exists
    if (locationLower) {
      filtered = filtered.filter(worker =>
        worker.location_address?.toLowerCase().includes(locationLower)
      );
    }

    setFilteredWorkers(filtered);
    toast({
      title: "Search Results",
      description: `Found ${filtered.length} workers matching your criteria.`,
    });
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    const filtered = workers.filter(worker =>
      worker.category.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );
    setFilteredWorkers(filtered);
    toast({
      title: "Category Selected",
      description: `Showing workers in ${categoryName}`,
    });
  };
  
  // Handle click when distance is unknown for a logged-in user
  const handleDistanceClick = () => {
    toast({
      title: "Set Your Location",
      description: "Please update your profile with your location to calculate distances.",
    });
    navigate('/profile');
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setFilteredWorkers(workers);
    toast({
      title: "Filters Cleared",
      description: "Showing all available workers.",
    });
  };

  const handleSearchClick = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Sorting logic for filteredWorkers
  useEffect(() => {
    let sorted = [...filteredWorkers];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === 'distance') {
      sorted.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    setFilteredWorkers(sorted);
    // eslint-disable-next-line
  }, [sortBy]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      {isOffline && (
        <div className="bg-yellow-200 text-yellow-900 text-center py-2 font-semibold">
          You are offline. Some features may be unavailable.
        </div>
      )}
      <main className="flex-grow">
        <Hero onSearch={handleSearch} ref={heroRef} inputRef={searchInputRef} />
        <CategorySelector categories={categories} onSelectCategory={handleCategorySelect} />
        <WorkerList
          workers={filteredWorkers}
          loading={loading}
          userLocation={userLocation}
          onClearFilters={handleClearFilters}
          onRefresh={() => initializePage()} // Re-run the whole init process on refresh
          onDistanceClick={handleDistanceClick}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </main>
      <BottomNavigation onSearchClick={handleSearchClick} />
    </div>
  );
};

export default Index;
