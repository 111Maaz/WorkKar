import React, { useState, forwardRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  className?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ onSearch, className }, ref) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`flex flex-col md:flex-row gap-2 w-full ${className}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          ref={ref}
          type="text"
          placeholder="Search for service or professional..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <Button 
        type="submit" 
        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-glow-primary"
      >
        Find Workers
      </Button>
    </form>
  );
});

export default SearchBar;
