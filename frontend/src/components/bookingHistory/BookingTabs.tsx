import React from 'react';

interface BookingTabsProps {
  activeTab: 'upcoming' | 'past';
  onTabChange: (tab: 'upcoming' | 'past') => void;
  upcomingCount: number;
  pastCount: number;
}

export const BookingTabs: React.FC<BookingTabsProps> = ({
  activeTab,
  onTabChange,
  upcomingCount,
  pastCount,
}) => {
  return (
    <div className="flex border-b border-gray-200 overflow-x-auto">
      <button
        onClick={() => onTabChange('upcoming')}
        className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${
          activeTab === 'upcoming'
            ? 'text-teal-600 border-b-2 border-teal-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span className="hidden sm:inline">Upcoming Appointments</span>
        <span className="sm:hidden">Upcoming</span>
        {upcomingCount > 0 && (
          <span className="ml-2 bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {upcomingCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange('past')}
        className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${
          activeTab === 'past'
            ? 'text-teal-600 border-b-2 border-teal-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span className="hidden sm:inline">Past Appointments</span>
        <span className="sm:hidden">Past</span>
        {pastCount > 0 && (
          <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {pastCount}
          </span>
        )}
      </button>
    </div>
  );
};
