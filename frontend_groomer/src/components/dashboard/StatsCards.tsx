// components/dashboard/StatsCards.tsx
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total',
      value: stats.total,
      icon: Calendar,
      color: 'text-gray-600',
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: AlertCircle,
      color: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <Icon className={`h-8 w-8 ${color}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
