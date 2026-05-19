import React from 'react';
import {
  Calendar,
  CheckCircle,
  Play,
  Clock,
  TrendingUp,
  Users,
  CalendarDays,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

interface StatCardData {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const StatsCards: React.FC = () => {
  const analytics = useAnalytics();

  const allStats: StatCardData[] = [
    {
      title: 'Total Bookings',
      value: analytics.totalBookings,
      icon: Calendar,
      color: 'blue',
      description: 'All time',
    },
    {
      title: 'Completed',
      value: analytics.completedBookings,
      icon: CheckCircle,
      color: 'green',
      description: 'All time',
    },
    {
      title: 'In Progress',
      value: analytics.inProgressBookings,
      icon: Play,
      color: 'yellow',
      description: 'Current',
    },
    {
      title: 'Scheduled',
      value: analytics.scheduledBookings,
      icon: Clock,
      color: 'purple',
      description: 'Upcoming',
    },
    {
      title: 'Cancelled',
      value: analytics.cancelledBookings,
      icon: XCircle,
      color: 'red',
      description: 'All time',
    },
    {
      title: 'Monthly Bookings',
      value: analytics.monthlyTotalBookings,
      icon: TrendingUp,
      color: 'indigo',
      description: 'This month',
    },
    {
      title: 'Repeat Customers',
      value: analytics.monthlyRepeatCustomers,
      icon: Users,
      color: 'pink',
      description: 'This month',
    },
    {
      title: "Today's Bookings",
      value: analytics.todayBookings,
      icon: CalendarDays,
      color: 'orange',
      description: 'Today',
    },
  ];

  const getColorClasses = (color: string) => ({
    border: `border-${color}-500`,
    iconBg: `bg-${color}-100`,
    iconText: `text-${color}-600`,
  });

  if (analytics.loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (analytics.error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">
              Failed to load analytics: {analytics.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Horizontal scrollable container */}
      {/* <div className="overflow-x-auto pb-4"> */}
      <div className="w-full pb-4">
        <div className="gap-4 justify-center grid grid-cols-1    md:grid-cols-2 lg:grid-cols-4 w-full">
          {allStats.map((stat, index) => {
            const { border, iconBg, iconText } = getColorClasses(stat.color);

            return (
              <div
                key={index}
                className={`flex-shrink-0 w-full bg-white rounded-xl shadow-md p-4 border-l-4 ${border} hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${iconBg} mr-3`}>
                    <stat.icon className={`h-5 w-5 ${iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {(stat.value || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator for mobile */}
      {/* <div className="sm:hidden text-center">
        <p className="text-xs text-gray-400">
          ← Scroll horizontally to view all stats →
        </p>
      </div> */}
    </div>
  );
};

export default StatsCards;
