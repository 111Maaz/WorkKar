import React from 'react';
import { 
  HardHat, Wrench, Paintbrush, Hammer, Zap, Flame, BookOpen, 
  Grid, LayoutGrid, Scissors, Sparkles, Droplets, Car, Trees, 
  Dog, Home, Settings, Palette, Lightbulb, Shield
} from 'lucide-react';

interface CategorySelectorProps {
  categories: string[];
  onSelectCategory: (categoryName: string) => void;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  // Primary categories with exact matches
  'Construction': HardHat,
  'Plumbing': Droplets,
  'Electrical': Zap,
  'Electrical Services': Zap,
  'Carpentry': Hammer,
  'Painting': Paintbrush,
  'Welding': Flame,
  'Home tutor': BookOpen,
  'Home Tutor': BookOpen,
  'Education': BookOpen,
  'Flooring / tiles': Grid,
  'Flooring / Tiles': Grid,
  'False ceiling': LayoutGrid,
  'False Ceiling': LayoutGrid,
  'Tailoring': Scissors,
  'Cleaning': Sparkles,
  'Cleaning Services': Sparkles,
  'Auto Repair': Car,
  
  // Additional categories that might appear
  'Landscaping': Trees,
  'Pet Care': Dog,
  'Home Services': Home,
  'Maintenance': Settings,
  'Repair': Wrench,
  'Art & Design': Palette,
  'Lighting': Lightbulb,
  'Security': Shield,
  
  // Fallback for variations
  'Other': Wrench,
  'default': Wrench
};

// Helper function to get the appropriate icon for a category
const getCategoryIcon = (categoryName: string): React.ElementType => {
  // First try exact match
  if (categoryIcons[categoryName]) {
    return categoryIcons[categoryName];
  }
  
  // Try case-insensitive match
  const lowerCategory = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (key.toLowerCase() === lowerCategory) {
      return icon;
    }
  }
  
  // Try partial matches for common variations
  if (lowerCategory.includes('electrical') || lowerCategory.includes('electric')) {
    return Zap;
  }
  if (lowerCategory.includes('plumbing') || lowerCategory.includes('plumber')) {
    return Droplets;
  }
  if (lowerCategory.includes('carpentry') || lowerCategory.includes('carpenter')) {
    return Hammer;
  }
  if (lowerCategory.includes('painting') || lowerCategory.includes('paint')) {
    return Paintbrush;
  }
  if (lowerCategory.includes('cleaning') || lowerCategory.includes('clean')) {
    return Sparkles;
  }
  if (lowerCategory.includes('tutor') || lowerCategory.includes('education') || lowerCategory.includes('teaching')) {
    return BookOpen;
  }
  if (lowerCategory.includes('construction') || lowerCategory.includes('build')) {
    return HardHat;
  }
  if (lowerCategory.includes('landscaping') || lowerCategory.includes('garden')) {
    return Trees;
  }
  if (lowerCategory.includes('auto') || lowerCategory.includes('car')) {
    return Car;
  }
  if (lowerCategory.includes('pet') || lowerCategory.includes('dog') || lowerCategory.includes('animal')) {
    return Dog;
  }
  
  // Default fallback
  return categoryIcons['default'];
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelectCategory }) => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find skilled professionals across different categories to help with your specific needs
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className="group relative flex flex-col items-center justify-center p-4 bg-card/60 dark:bg-card/50 backdrop-blur-sm rounded-lg border border-border/30 shadow-md hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{backgroundSize: '200% 200%'}}></div>
                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className="mb-3 p-3 bg-background/50 rounded-full transition-colors duration-300 group-hover:bg-background/70">
                    <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-medium text-foreground text-center">{category}</h3>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
};

export default CategorySelector;
