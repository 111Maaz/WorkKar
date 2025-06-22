import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/UI/button';

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  onRetry, 
  message = "Something went wrong while loading workers. Please try again." 
}) => {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 max-w-md mx-auto">{message}</p>
      </div>
      <Button 
        onClick={onRetry}
        className="flex items-center gap-2"
      >
        <RefreshCw size={16} />
        Try Again
      </Button>
    </div>
  );
};

export default ErrorState;
