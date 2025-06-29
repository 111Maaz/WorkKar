import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/button';
import { RotateCcw } from 'lucide-react';

interface FooterProps {
  className?: string;
  onResetWelcome?: () => void;
}

const Footer: React.FC<FooterProps> = ({ className, onResetWelcome }) => {
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
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="text-sm text-primary-foreground/70">
              <p>&copy; {new Date().getFullYear()} WorkKar. All rights reserved.</p>
            </div>
            {onResetWelcome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetWelcome}
                className="text-primary-foreground/70 hover:text-primary-foreground text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Welcome
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
