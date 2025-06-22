import React from 'react';
import { 
  HardHat, Wrench, Paintbrush, Hammer, Zap, Flame, BookOpen, 
  Grid, LayoutGrid, Scissors, Sparkles 
} from 'lucide-react';

interface CategorySelectorProps {
  categories: string[];
  onSelectCategory: (categoryName: string) => void;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  'Construction': HardHat,
  'Plumbing': Wrench,
  'Electrical': Zap,
  'Carpentry': Hammer,
  'Painting': Paintbrush,
  'Welding': Flame,
  'Home tutor': BookOpen,
  'Flooring / tiles': Grid,
  'False ceiling': LayoutGrid,
  'Tailoring': Scissors,
  'Cleaning': Sparkles,
  'Other': Wrench,
  'default': Wrench
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
            const Icon = categoryIcons[category] || categoryIcons['default'];
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
