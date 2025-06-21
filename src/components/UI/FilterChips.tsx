
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterChip {
  id: string;
  label: string;
  type: 'category' | 'service' | 'distance' | 'other';
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onRemoveFilter, onClearAll }) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear All
        </Button>
      )}
    </div>
  );
};

export default FilterChips;
