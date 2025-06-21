import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Worker } from '@/types';
import { Button } from '@/components/UI/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/UI/avatar";

interface WorkerCardProps {
  worker: Worker;
  onClick: (workerId: string) => void;
  className?: string;
}

const categoryColors: { [key: string]: string } = {
  'Construction': 'border-t-red-500',
  'Plumbing': 'border-t-blue-500',
  'Electrical': 'border-t-yellow-500',
  'Carpentry': 'border-t-orange-500',
  'Painting': 'border-t-purple-500',
  'Welding': 'border-t-gray-500',
  'Home Tutor': 'border-t-green-500',
  'Flooring / Tiles': 'border-t-indigo-500',
  'False Ceiling': 'border-t-cyan-500',
  'Tailoring': 'border-t-pink-500',
  'Cleaning': 'border-t-teal-500',
  'default': 'border-t-slate-500'
};

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onClick, className }) => {
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open device's default dialer with pre-filled number
    window.location.href = `tel:${worker.mobile}`;
  };

  const accentColor = categoryColors[worker.category] || categoryColors['default'];

  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out",
        "border-l border-r border-b border-border/20",
        "hover:shadow-xl hover:-translate-y-1.5 cursor-pointer",
        accentColor,
        "border-t-4",
        className
      )}
      onClick={() => onClick(worker.id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-4 mb-3">
          <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary transition-colors">
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {worker.name ? worker.name.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">{worker.name}</h3>
              {worker.availability && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" title="Available now"></div>}
            </div>
            <p className="text-muted-foreground text-sm font-medium">{worker.category}</p>
            <p className="text-muted-foreground text-xs">{worker.tags.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            {worker.distance ? (
              <span>{`${worker.distance.toFixed(1)} km away`}</span>
            ) : (
              <a href="/auth" className="text-primary hover:underline font-medium">
                Know the distance
              </a>
            )}
          </div>
          
          <Button 
            onClick={handleCall}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:animate-pulse"
          >
            <Phone size={16} />
            Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
