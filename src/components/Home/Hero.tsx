import React, { forwardRef } from 'react';
import SearchBar from '../UI/SearchBar';

interface HeroProps {
  onSearch: (query: string, location: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
}

const Hero = forwardRef<HTMLDivElement, HeroProps>(({ onSearch, inputRef }, ref) => {
  return (
    <div className="relative pt-20 pb-10 animated-gradient" ref={ref}>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in-up">
          Find Skilled Professionals In Your Area
        </h1>
        <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
          Connect with verified local workers for your home, business, or personal needs.
          Get jobs done quickly, reliably, and affordably.
        </p>
        
        <div className="max-w-3xl mx-auto animate-fade-in-up [animation-delay:400ms]">
          <div className="bg-background/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
            <SearchBar 
              ref={inputRef}
              onSearch={onSearch} 
            />
          </div>
        </div>
        
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-4 text-secondary-foreground animate-fade-in-up [animation-delay:600ms]">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Verified Professionals</span>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Fast Response Times</span>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span>Same-Day Availability</span>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span>Secure Payments</span>
          </div>
        </div>
      </div>
      
      {/* Wave Design */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto text-background">
          <path fill="currentColor" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,74.7C960,85,1056,107,1152,112C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
});

export default Hero;
