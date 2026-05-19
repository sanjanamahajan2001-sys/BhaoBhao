// components/dashboard/FilterTabs.tsx
interface FilterTabsProps {
  filter: string;
  setFilter: (
    filter: 'all' | 'scheduled' | 'in-progress' | 'completed'
  ) => void;
  stats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  filter,
  setFilter,
  stats,
}) => {
  const tabs = [
    { key: 'all', label: `All (${stats.total})` },
    { key: 'scheduled', label: `Scheduled (${stats.scheduled})` },
    { key: 'in-progress', label: `In Progress (${stats.inProgress})` },
    { key: 'completed', label: `Completed (${stats.completed})` },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex flex-wrap md:flex-nowrap gap-4 md:space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              filter === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
