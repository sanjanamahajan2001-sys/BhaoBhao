import React from 'react';
import {
  Sparkles,
  Dog,
  Heart,
  Stethoscope,
  Home,
  Calendar,
  Apple,
  Star,
} from 'lucide-react';
import { Category } from '@/types/booking.type';

interface CategoryStepProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  isLoading: boolean;
}

// Icon mapping for categories
const getIconForCategory = (name: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    Groomings: <Sparkles className="h-8 w-8" />,
    'Dog Walking': <Dog className="h-8 w-8" />,
    Training: <Heart className="h-8 w-8" />,
    'Veterinary Care': <Stethoscope className="h-8 w-8" />,
    'Pet Sitting': <Home className="h-8 w-8" />,
    'Day Care': <Calendar className="h-8 w-8" />,
    Nutrition: <Apple className="h-8 w-8" />,
    'Spa & Wellness': <Star className="h-8 w-8" />,
  };

  return iconMap[name] || <Sparkles className="h-8 w-8" />;
};

// 🔥 Skeleton Card Component
const SkeletonCard = () => (
  <div className="p-6 rounded-xl border-2 border-gray-200 bg-white animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="mt-3 h-24 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

const CategoryStep: React.FC<CategoryStepProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Choose Service Category
        </h2>
        <p className="text-gray-600 max-sm:hidden">
          Select the type of service you need for your pet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          // isLoading
          // ? // Show 6 skeleton cards while loading
          // Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          // :
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className={`
                  p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg
                  ${
                    selectedCategory?.id === category.id
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-teal-300'
                  }
                `}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`
                      p-3 rounded-lg flex-shrink-0
                      ${
                        selectedCategory?.id === category.id
                          ? 'bg-teal-100 text-teal-600'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}
                >
                  {getIconForCategory(category.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`
                        font-semibold text-lg mb-2
                        ${
                          selectedCategory?.id === category.id
                            ? 'text-teal-900'
                            : 'text-gray-900'
                        }
                      `}
                  >
                    {category.name}
                  </h3>
                  <p
                    className={`
                        text-sm leading-relaxed
                        ${
                          selectedCategory?.id === category.id
                            ? 'text-teal-700'
                            : 'text-gray-600'
                        }
                      `}
                  >
                    {category.description}
                  </p>

                  {/* Category image */}
                  {category.photos && category.photos.length > 0 && (
                    <div className="mt-3">
                      <img
                        src={`/images/${category.photos[0]}`}
                        alt={category.name}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedCategory?.id === category.id && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))
        }
      </div>

      {!isLoading && categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Sparkles className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Categories Available
          </h3>
          <p className="text-gray-600">
            We're currently updating our services. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryStep;
