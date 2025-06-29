import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Search, MapPin, Star, Shield, Clock, Users, ArrowRight, ArrowLeft, X, CheckCircle } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const seen = localStorage.getItem('workkar-welcome-seen');
    if (seen === 'true') {
      setHasSeenWelcome(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to WorkKar! 👋",
      description: "Your trusted platform for finding skilled local professionals",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with Local Experts</h3>
            <p className="text-muted-foreground">
              Find verified professionals for your home, business, or personal needs. 
              Get jobs done quickly, reliably, and affordably.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Verified Workers</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Fast Response</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How to Find Workers 🔍",
      description: "Discover skilled professionals in your area",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Search by Service</h4>
                <p className="text-sm text-muted-foreground">
                  Use the search bar to find specific services like "plumber", "electrician", or "cleaner"
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Browse Categories</h4>
                <p className="text-sm text-muted-foreground">
                  Explore different service categories to find the right professional for your needs
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-medium">3</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Check Ratings & Reviews</h4>
                <p className="text-sm text-muted-foreground">
                  Read reviews and check ratings to choose the best worker for your project
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Pro Tip</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Workers are automatically sorted by distance, so you'll see the closest professionals first!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Understanding Worker Profiles 📋",
      description: "What to look for when choosing a professional",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Worker Card Information</h4>
                <Badge variant="secondary">Example</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">4.8 (24 reviews)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">2.3 km away</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Verified</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Key Information to Check:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Verification status</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Distance from your location</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Service categories and specializations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Contact information</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Getting Started 🚀",
      description: "Ready to find your perfect professional?",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
            <p className="text-muted-foreground mb-6">
              You now know how to find and connect with skilled professionals on WorkKar.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Search for a service you need</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Browse worker profiles and reviews</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Contact your chosen professional</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Get your job done!</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Safety First</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Always verify worker credentials and read reviews before hiring. 
                WorkKar verifies all professionals, but it's good practice to do your own research too.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('workkar-welcome-seen', 'true');
    setHasSeenWelcome(true);
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (hasSeenWelcome) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-center">
            {steps[currentStep].title}
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            {steps[currentStep].description}
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {steps[currentStep].content}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal; 