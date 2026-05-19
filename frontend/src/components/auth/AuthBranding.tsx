import React from 'react';
import { Scissors, Heart, Sparkles } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

const features: Feature[] = [
  { icon: Scissors, text: 'Experienced, gentle groomers' },
  { icon: Heart, text: 'Professional Equipments' },
  { icon: Sparkles, text: 'Comfortable home environment​' },
];

const AuthBranding: React.FC = () => {
  return (
    <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <div className="max-w-md w-full text-center lg:text-left animate-fadeIn">
        <div className="sm:mb-8 flex items-center max-lg:flex-col lg:gap-4">
          {/* <div className="bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl w-16 h-16 mx-auto lg:mx-0 mb-4"> */}
          <div className="rounded-2xl w-28 sm:w-32 h-auto mx-auto lg:mx-0 mb-4">
            <img
              src="/auth/logo-simple.png"
              alt="Bhao Bhao"
              className="h-full w-full object-contain rounded-lg"
              onError={(e) => {
                // Fallback to root path if /auth/ path doesn't work
                const img = e.target as HTMLImageElement;
                if (img.src.includes('/auth/')) {
                  img.src = '/logo-simple.png';
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              {/* Bhao <span className="text-teal-600">Bhao</span> */}
              Bhao Bhao
            </h1>
            <p className="text-xl text-gray-600 font-semibold">
              In-home Pet Grooming Experts
            </p>
          </div>
        </div>

        <div className="space-y-4 max-sm:hidden">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 lg:justify-start justify-center"
            >
              <feature.icon className="h-5 w-5 text-teal-600" />
              <span className="text-gray-700 font-semibold">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthBranding;

