import React, { useState } from 'react';
import WorkerCard from './WorkerCard';
import LoadingState from '../UI/LoadingState';
import NoResultsState from '../UI/NoResultsState';
import ErrorState from '../UI/ErrorState';
import { Worker } from '@/types';
import { Button } from '@/components/UI/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/UI/select';

interface WorkerListProps {
  workers: Worker[];
  loading?: boolean;
  error?: boolean;
  userLocation: { latitude: number; longitude: number; } | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  onDistanceClick: () => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

const WorkerList: React.FC<WorkerListProps> = ({ 
  workers, 
  loading = false, 
  error = false, 
  userLocation,
  onRetry, 
  onClearFilters,
  onRefresh,
  onDistanceClick,
  sortBy = 'distance',
  onSortChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const workersPerPage = 6;

  // Get current workers for pagination
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = workers.slice(indexOfFirstWorker, indexOfLastWorker);
  const totalPages = Math.ceil(workers.length / workersPerPage);

  // Show error state
  if (error) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <ErrorState onRetry={onRetry || (() => {})} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 mb-20 md:mb-0">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <h2 className="text-2xl font-bold text-gray-900">Available Workers</h2>
              <div className="flex items-center gap-2">
                {onClearFilters && (
                  <Button size="sm" variant="outline" onClick={onClearFilters}>
                    Clear Filters
                  </Button>
                )}
                {onRefresh && (
                  <Button size="sm" variant="secondary" onClick={onRefresh}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                    Refresh
                  </Button>
                )}
              </div>
            </div>
            {onSortChange && (
              <div className="w-full md:w-[180px] mt-2 md:mt-0 md:ml-2">
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Sort by ratings</SelectItem>
                    <SelectItem value="distance">Sort by dist (km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-2 md:mt-0 w-full md:w-auto text-right">{workers.length} professionals found</p>
        </div>

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* No Results State */}
        {!loading && !error && workers.length === 0 && (
          <NoResultsState onResetFilters={() => setCurrentPage(1)} />
        )}

        {/* Workers Grid */}
        {!loading && !error && workers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentWorkers.map(worker => (
                <WorkerCard 
                  key={worker.id} 
                  worker={worker} 
                  userLocation={userLocation}
                  onDistanceClick={onDistanceClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default WorkerList;
