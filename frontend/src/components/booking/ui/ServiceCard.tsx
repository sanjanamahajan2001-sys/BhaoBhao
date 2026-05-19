import React from 'react';
import { Scissors, CheckCircle } from 'lucide-react';
import { Service } from '@/types/booking.type';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 sm:p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
        isSelected
          ? 'border-teal-600 bg-teal-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
          <div
            className={`p-3 rounded-xl transition-all ${
              isSelected ? 'bg-teal-600 shadow-lg' : 'bg-gray-100'
            }`}
          >
            <Scissors
              className={`h-6 w-6 ${
                isSelected ? 'text-white' : 'text-gray-600'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
              {service.name}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right sm:ml-6">
          <div className="flex items-center space-x-2 mb-1 sm:justify-end">
            <span className="text-xl sm:text-2xl font-bold text-teal-600">
              ₹{service.discountPrice}
            </span>
            <span className="text-sm sm:text-lg text-gray-400 line-through">
              ₹{service.originalPrice}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full w-fit sm:ml-auto">
            {service.discount}% OFF
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-teal-200">
          <div className="flex items-center space-x-2 text-teal-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Selected</span>
          </div>
        </div>
      )}
    </button>
  );
};

export default ServiceCard;
