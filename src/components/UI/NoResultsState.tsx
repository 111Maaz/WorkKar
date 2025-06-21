
import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoResultsStateProps {
  onResetFilters: () => void;
  searchQuery?: string;
}

const NoResultsState: React.FC<NoResultsStateProps> = ({ onResetFilters, searchQuery }) => {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No workers found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {searchQuery 
            ? `We couldn't find any workers matching "${searchQuery}". Try adjusting your search or filters.`
            : "We couldn't find any workers matching your current filters. Try adjusting your search criteria."
          }
        </p>
      </div>
      {/* <Button 
        onClick={onResetFilters}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RotateCcw size={16} />
        Reset Filters
      </Button> */}
    </div>
  );
};

export default NoResultsState;
