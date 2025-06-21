
import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  size = 16,
  className 
}) => {
  // Convert rating to nearest half star
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = hasHalfStar ? 4 - fullStars : 5 - fullStars;

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="#FFB800" color="#FFB800" size={size} />
      ))}
      
      {hasHalfStar && <StarHalf fill="#FFB800" color="#FFB800" size={size} />}
      
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} color="#D1D5DB" size={size} />
      ))}
    </div>
  );
};

export default RatingStars;
