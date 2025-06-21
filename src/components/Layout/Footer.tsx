import React from 'react';
import { cn } from '@/lib/utils';

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={cn("animated-gradient text-white", className)}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-xl">
              Work<span className="text-primary-foreground/80">Kar</span>
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Connecting skilled professionals with you.
            </p>
          </div>
          <div className="text-sm text-primary-foreground/70">
            <p>&copy; {new Date().getFullYear()} WorkKar. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
