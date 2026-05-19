import React from 'react';
// import { ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface BookingProgressProps {
  currentStep: number;
  steps: Step[];
}

const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
  steps,
}) => {
  // const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
        {/* <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-800 p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button> */}
      </div>

      <div className="flex items-center space-x-2 mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex-1 h-2 rounded-full ${
                step.id <= currentStep ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            ></div>
            {index < steps.length - 1 && <div className="w-2"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            Step {currentStep} of {steps.length}
          </div>
          <div className="text-lg font-bold text-teal-600">
            {steps[currentStep - 1]?.title}
          </div>
          <div className="text-sm text-gray-600">
            {steps[currentStep - 1]?.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProgress;
