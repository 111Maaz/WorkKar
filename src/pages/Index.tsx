import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Hero from '@/components/Home/Hero';
import CategorySelector from '@/components/Home/CategorySelector';
import WorkerList from '@/components/Workers/WorkerList';
import BottomNavigation from '@/components/Layout/BottomNavigation';
import { Worker } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Haversine formula for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return undefined;
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

  // 1. Fetch workers and calculate distances based on user's location
  const fetchAndProcessWorkers = useCallback(async (userLocation: { latitude: number, longitude: number } | null) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data
      let transformedWorkers: Worker[] = data.map((worker: any) => {
        try {
          let latitude = 0, longitude = 0;
          if (worker.location_coordinates) {
            const match = typeof worker.location_coordinates === 'string'
              ? worker.location_coordinates.match(/POINT\(([-\d.]+) ([-\d.]+)\)/)
              : null;
            if (match) {
              longitude = parseFloat(match[1]);
              latitude = parseFloat(match[2]);
            }
          }
          return {
            id: worker.id.toString(),
            name: worker.full_name,
            avatar: '/placeholder.svg',
            profession: worker.service_category,
            category: worker.service_category,
            rating: 0, numReviews: 0, hourlyRate: 0,
            location: { latitude, longitude },
            location_address: worker.location_address,
            distance: userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, latitude, longitude) : undefined,
            tags: [worker.service_subcategory],
            bio: '', availability: true,
            joined: new Date(worker.created_at).toLocaleDateString(),
            mobile: worker.mobile_number,
            businessName: worker.business_name || ''
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
    let userLocation: { latitude: number, longitude: number } | null = null;
    
    // Try getting location from LocalStorage first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        userLocation = JSON.parse(savedLocation);
        localStorage.removeItem('userLocation'); // Clean up after use
      } catch (e) {
        console.error("Failed to parse saved location", e);
      }
    }

    // If no location from LocalStorage, try browser geolocation
    if (!userLocation && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (err) {
          console.error('Error getting location:', err);
      }
    }
    
    // Finally, fetch workers with whatever location we found (or null)
    await fetchAndProcessWorkers(userLocation);
  }, [fetchAndProcessWorkers]);

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
  
  // Handle worker profile click
  const handleWorkerClick = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      toast({
        title: "Worker Profile",
        description: `Viewing ${worker.name}'s profile. This would navigate to a detailed profile page.`,
      });
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero onSearch={handleSearch} ref={heroRef} inputRef={searchInputRef} />
        <CategorySelector categories={categories} onSelectCategory={handleCategorySelect} />
        <WorkerList
          workers={filteredWorkers}
          loading={loading}
          onWorkerClick={handleWorkerClick}
          onClearFilters={handleClearFilters}
          onRefresh={() => initializePage()} // Re-run the whole init process on refresh
        />
      </main>
      <Footer />
      <BottomNavigation onSearchClick={handleSearchClick} />
    </div>
  );
};

export default Index;
