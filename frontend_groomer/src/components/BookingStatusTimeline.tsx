import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { BookingData } from '../types';

export const BookingStatusTimeline: React.FC<{ booking: BookingData }> = ({
  booking,
}) => {
  const status = booking.booking.status;

  const steps = [
    {
      id: 'scheduled',
      name: 'Scheduled',
      icon: Calendar,
      status: 'Scheduled',
      description: 'Appointment scheduled',
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      icon: Clock,
      status: 'In Progress',
      description: 'Service in progress',
    },
    {
      id: 'completed',
      name: 'Completed',
      icon: CheckCircle,
      status: 'Completed',
      description: 'Service completed',
    },
  ];

  const getStepStatus = (step: (typeof steps)[0]) => {
    if (status === 'Completed') return 'completed'; // ✅ force all green

    if (step.status === status) return 'current';

    const statusOrder = ['Scheduled', 'In Progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(step.status);

    return stepIndex < currentIndex ? 'completed' : 'upcoming';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Booking Progress
      </h3>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center md:w-1/3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    stepStatus === 'completed'
                      ? 'bg-green-600 border-green-600 text-white'
                      : stepStatus === 'current'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      stepStatus === 'completed' || stepStatus === 'current'
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block flex-1 h-0.5 mx-2 ${
                    status === 'Completed' // ✅ all connectors green if completed
                      ? 'bg-green-600'
                      : getStepStatus(steps[index + 1]) === 'completed' ||
                        (getStepStatus(steps[index + 1]) === 'current' &&
                          stepStatus === 'completed')
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
