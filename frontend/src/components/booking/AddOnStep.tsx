import React from 'react';
import { CheckCircle } from 'lucide-react';

const AddOnStep = ({ selectedAddOns, onSelectAddOn }) => {
  const addOns = [
    { id: 1, name: 'Nail Trimming', description: 'Quick and clean nail trim', price: 299 },
    { id: 2, name: 'Teeth Cleaning', description: 'Keep your pet’s smile healthy', price: 499 },
    { id: 3, name: 'Ear Cleaning', description: 'Gentle ear cleaning service', price: 199 },
    { id: 4, name: 'De-shedding Treatment', description: 'Reduce shedding effectively', price: 699 },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Choose your add-on</h2>
      <p className="text-gray-500 mb-6">
        Select the perfect add-on for your pet service
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {addOns.map((item) => {
          const selected = selectedAddOns.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onSelectAddOn(item.id)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                {selected && <CheckCircle className="text-teal-600 w-6 h-6" />}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-800">
                ₹{item.price}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddOnStep;
